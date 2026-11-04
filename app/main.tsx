import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
 
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash']; // principal, reserva
const GEMINI_API_KEY = 'AQ.Ab8RN6IndLRxrlz9LE4ZX4KLbucsSFNXL5sd77TZBq1THsPrdA'.trim();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mensagens dinâmicas de carregamento
const LOADING_MESSAGES = [
  'Analisando com IA...',
  'Lendo o conteúdo do documento...',
  'Identificando os pontos mais importantes...',
  'Resumindo as informações para você...',
  'Organizando os alertas e próximos passos...',
  'Quase pronto...',
];

const THEME = {
  bg: '#070710',
  surface: '#0E0E1A',
  card: '#12121F',
  cardElevated: '#16162A',
  primary: '#7B6EF6',
  primaryDim: 'rgba(123,110,246,0.12)',
  accent: '#00E5C3',
  accentDim: 'rgba(0,229,195,0.10)',
  success: '#23D97A',
  successDim: 'rgba(35,217,122,0.10)',
  danger: '#FF5A7A',
  dangerDim: 'rgba(255,90,122,0.10)',
  amber: '#F59E0B',
  text: '#F1F1F6',
  textSoft: '#C0C0D0',
  textMuted: '#6B6B80',
  border: 'rgba(255,255,255,0.06)',
  borderMid: 'rgba(255,255,255,0.10)',
};
 
type FileType = {
  uri: string;
  base64: string;
  mimeType: string;
  name: string;
  isImage: boolean;
  aspectRatio?: number;
};
 
// ─── Animated Card com Função Copiar ───────────────────────────
function ResultCard({
  icon,
  iconColor,
  accentColor,
  title,
  text,
  delay = 0,
}: {
  icon: string;
  iconColor: string;
  accentColor: string;
  title: string;
  text: string;
  delay?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCopy = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copiado!', `${title} copiado para a área de transferência.`);
  };
 
  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={[styles.resultCard, { borderLeftColor: accentColor }]}>
        <View style={[styles.cardGlow, { backgroundColor: accentColor }]} />
 
        <View style={styles.resultCardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBadge, { backgroundColor: accentColor + '1A' }]}>
              <Ionicons name={icon as any} size={18} color={iconColor} />
            </View>
            <Text style={styles.resultCardTitle}>{title}</Text>
          </View>
           
          <TouchableOpacity onPress={handleCopy} style={styles.copyButton} activeOpacity={0.6}>
            <Ionicons name="copy-outline" size={16} color={THEME.textMuted} />
          </TouchableOpacity>
        </View>
 
        <Text style={styles.resultText}>{text}</Text>
      </View>
    </Animated.View>
  );
}
 
// ─── Pulse Ring ───────────────────────────────────────────────
function PulseRing({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;
 
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.6, duration: 1200, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
 
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 1.5,
        borderColor: color,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}
 
// ─── Scanning Line Adaptada ───────────────────────────────────
function ScanLine() {
  const translateY = useRef(new Animated.Value(-140)).current;
 
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 140,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -140,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
 
  return (
    <Animated.View style={[styles.scanLine, { transform: [{ translateY }], pointerEvents: 'none' }]}>
      <LinearGradient
        colors={['transparent', THEME.accent + 'AA', 'transparent']}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}
 
// ─── Loading Dots ─────────────────────────────────────────────
function LoadingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
 
  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
  }, []);
 
  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 16 }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: THEME.accent,
            opacity: dot,
            transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }}
        />
      ))}
    </View>
  );
}
 
// ─── Helpers ──────────────────────────────────────────────────
const MAX_FILE_MB = 15;
const MAX_TOTAL_MB = 18;
const MAX_FILES = 10;

async function blobUriToBase64(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function uriToBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') return blobUriToBase64(uri);

  const errors: string[] = [];

  try {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  } catch (e: any) {
    errors.push(`legacy: ${e?.message}`);
  }

  try {
    const { File } = require('expo-file-system');
    return await new File(uri).base64();
  } catch (e: any) {
    errors.push(`File: ${e?.message}`);
  }

  try {
    const copy = `${FileSystem.cacheDirectory}upload-${Date.now()}`;
    await FileSystem.copyAsync({ from: uri, to: copy });
    return await FileSystem.readAsStringAsync(copy, { encoding: FileSystem.EncodingType.Base64 });
  } catch (e: any) {
    errors.push(`copy: ${e?.message}`);
  }

  try {
    return await blobUriToBase64(uri);
  } catch (e: any) {
    errors.push(`fetch: ${e?.message}`);
  }

  throw new Error(`Não foi possível ler o arquivo.\n${errors.join('\n')}`);
}

// ─── PDF do relatório ─────────────────────────────────────────
const escapeHtml = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function textToHtml(text: string): string {
  const lines = escapeHtml(text).split(/\r?\n/);
  let html = '';
  let inList = false;

  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[*\-•]\s+(.*)$/);
    const formatted = (bullet ? bullet[1] : line).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    if (bullet) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${formatted}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (line) html += `<p>${formatted}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
}

function buildReportHtml(opts: {
  summary: string;
  attention: string;
  nextStep: string;
  fileNames: string[];
}): string {
  const { summary, attention, nextStep, fileNames } = opts;
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const section = (title: string, color: string, text: string) =>
    text
      ? `<div class="card" style="border-left-color:${color}">
           <h2 style="color:${color}">${title}</h2>
           ${textToHtml(text)}
         </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @page { margin: 28px; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #1A1A2E; margin: 0; padding: 8px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid ${THEME.primary}; padding-bottom: 12px; margin-bottom: 18px; }
    .brand { font-size: 22px; font-weight: 700; }
    .brand span { color: ${THEME.accent}; }
    .date { font-size: 12px; color: #6B6B80; }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: ${THEME.primary}; background: #EFEDFE; border-radius: 20px; padding: 4px 12px; margin-bottom: 14px; }
    .files { font-size: 12px; color: #6B6B80; margin-bottom: 18px; }
    .card { border: 1px solid #E5E5EE; border-left: 5px solid; border-radius: 12px; padding: 14px 18px; margin-bottom: 16px; page-break-inside: avoid; }
    .card h2 { font-size: 15px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.8px; }
    .card p, .card li { font-size: 14px; line-height: 1.6; margin: 0 0 8px 0; }
    .card ul { margin: 0 0 8px 0; padding-left: 20px; }
    .footer { margin-top: 24px; font-size: 11px; color: #9A9AAE; text-align: center; border-top: 1px solid #E5E5EE; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Desburocrata<span>.</span></div>
    <div class="date">${escapeHtml(date)}</div>
  </div>
  <div class="badge">ANÁLISE CONCLUÍDA</div>
  ${fileNames.length ? `<div class="files">Documento(s) analisado(s): ${escapeHtml(fileNames.join(', '))}</div>` : ''}
  ${section('Resumo', THEME.primary, summary)}
  ${section('Atenção', THEME.danger, attention)}
  ${section('Próximo Passo', '#16A34A', nextStep)}
  <div class="footer">Relatório gerado por IA. Confira as informações importantes no documento original.</div>
</body>
</html>`;
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [summary, setSummary] = useState('');
  const [attention, setAttention] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);
 
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-12)).current;
 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerY, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  // Efeito que alterna as mensagens de carregamento enquanto loading for true
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingMessageIndex(0);
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500); // Troca a mensagem a cada 2.5 segundos
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);
 
  const addFiles = (newFiles: FileType[]) => {
    if (!newFiles.length) return;
    const current = selectedFiles;
    const combined = [...current, ...newFiles];

    if (combined.length > MAX_FILES) {
      return Alert.alert('Muitos arquivos', `Você pode analisar até ${MAX_FILES} arquivos por vez.`);
    }
    const totalBytes = combined.reduce((sum, f) => sum + (f.base64.length * 3) / 4, 0);
    if (totalBytes > MAX_TOTAL_MB * 1024 * 1024) {
      return Alert.alert('Arquivos grandes demais', `O total precisa ficar abaixo de ${MAX_TOTAL_MB} MB.`);
    }

    toggleAnimation();
    setSelectedFiles(combined);
    resetResult();
  };

  const removeFileAt = (index: number) => {
    toggleAnimation();
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    resetResult();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
 
  const toggleAnimation = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };
 
  const takePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      return Alert.alert('Permissão Negada', 'Precisamos acessar sua câmera.');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false, 
      quality: 0.9,
      base64: true,
    });
    processFileResult(result, true);
  };
 
  const pickImageFromGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      return Alert.alert('Permissão Negada', 'Precisamos acessar sua galeria.');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: MAX_FILES,
      quality: 0.9,
      base64: true,
    });
    processFileResult(result, true);
  };
 
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || !result.assets?.length) return;

      const tooBig = result.assets.find((f) => f.size && f.size > MAX_FILE_MB * 1024 * 1024);
      if (tooBig) {
        return Alert.alert('Arquivo grande demais', `"${tooBig.name}" passa de ${MAX_FILE_MB} MB.`);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const files: FileType[] = await Promise.all(
        result.assets.map(async (file) => {
          const mimeType = file.mimeType || 'application/pdf';
          return {
            uri: file.uri,
            base64: await uriToBase64(file.uri),
            mimeType,
            name: file.name,
            isImage: mimeType.startsWith('image/'),
          };
        })
      );
      addFiles(files);
    } catch (e: any) {
      console.error('pickDocument error:', e);
      Alert.alert('Erro', `Não foi possível selecionar o documento.\n\n${e?.message ?? ''}`);
    }
  };

  const processFileResult = async (result: any, isImage: boolean) => {
    if (result.canceled || !result.assets?.length) return;
    try {
      const files: FileType[] = await Promise.all(
        result.assets.map(async (asset: any, i: number) => ({
          uri: asset.uri,
          base64: asset.base64 || (await uriToBase64(asset.uri)),
          mimeType: asset.mimeType || (isImage ? 'image/jpeg' : 'application/pdf'),
          name: isImage ? `documento-${selectedFiles.length + i + 1}.jpg` : asset.name || 'arquivo',
          isImage,
          aspectRatio: asset.width && asset.height ? asset.width / asset.height : undefined,
        }))
      );
      addFiles(files);
    } catch (e: any) {
      console.error('processFileResult error:', e);
      Alert.alert('Erro', `Não foi possível carregar a imagem.\n\n${e?.message ?? ''}`);
    }
  };

  const analyzeFile = async () => {
    if (!selectedFiles.length) return;
    resetResult();
    setLoading(true);
    try {
      const multi = selectedFiles.length > 1;
      const body = JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
Explique ${multi ? 'os documentos enviados (podem ser páginas do mesmo documento ou documentos diferentes; analise tudo em conjunto e deixe claro quando algo vier de um documento específico)' : 'o documento'} como se estivesse falando com uma pessoa comum.
Use linguagem simples, direta e curta.

Responda exatamente nesse formato:

RESUMO:
...

ATENÇÃO:
...

PRÓXIMO PASSO:
...
                `,
              },
              ...selectedFiles.map((f) => ({
                inline_data: {
                  mime_type: f.mimeType,
                  data: f.base64,
                },
              })),
            ],
          },
        ],
      });

      let response: Response | null = null;
      let data: any = null;
      let lastNetworkError = '';

      outer: for (const model of GEMINI_MODELS) {
        for (let attempt = 0; attempt < 3; attempt++) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 45000);
          try {
            console.log(`[Gemini] ${model} - tentativa ${attempt + 1}`);
            response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
                signal: controller.signal,
              }
            );
            data = await response.json();
            console.log(`[Gemini] ${model} respondeu com status ${response.status}`);
          } catch (err: any) {
            response = null;
            lastNetworkError = err?.name === 'AbortError' ? 'A IA demorou demais para responder.' : (err?.message ?? 'Falha de rede.');
            console.warn(`[Gemini] ${model} falhou:`, lastNetworkError);
          } finally {
            clearTimeout(timer);
          }

          if (response?.ok) break outer;
          if (response && response.status !== 503 && response.status !== 429) break outer;
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        }
      }

      if (!response) {
        Alert.alert('Erro', `${lastNetworkError || 'Não foi possível falar com a IA.'}\n\nTente novamente em instantes.`);
        return;
      }
      if (!response.ok) {
        console.error('Gemini error:', response.status, data);
        Alert.alert('Erro na IA', `(${response.status}) ${data?.error?.message ?? 'Falha ao analisar o documento.'}`);
        return;
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.error('Gemini sem texto:', JSON.stringify(data));
        Alert.alert('Erro', 'A IA não devolveu uma resposta para este documento. Tente outro arquivo.');
        return;
      }
      parseAIResponse(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      console.error('analyzeFile error:', e);
      Alert.alert('Erro', `Erro de conexão com a IA.\n\n${e?.message ?? ''}`);
    } finally {
      setLoading(false);
    }
  };
 
  const parseAIResponse = (text: string) => {
    const resumo = text.match(/RESUMO:([\s\S]*?)(ATENÇÃO:|$)/)?.[1]?.trim() || '';
    const atencao = text.match(/ATENÇÃO:([\s\S]*?)(PRÓXIMO PASSO:|$)/)?.[1]?.trim() || '';
    const proximo = text.match(/PRÓXIMO PASSO:([\s\S]*)/)?.[1]?.trim() || '';
    setSummary(resumo);
    setAttention(atencao);
    setNextStep(proximo);
  };
 
  const resetResult = () => {
    setSummary('');
    setAttention('');
    setNextStep('');
  };
 
  const removeSelectedFile = () => {
    toggleAnimation();
    setSelectedFiles([]);
    resetResult();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
 
  const downloadPdf = async () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      const html = buildReportHtml({
        summary,
        attention,
        nextStep,
        fileNames: selectedFiles.map((f) => f.name),
      });

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      const stamp = new Date().toISOString().slice(0, 10);
      const target = `${FileSystem.cacheDirectory}Desburocrata-relatorio-${stamp}.pdf`;
      let finalUri = uri;
      try {
        await FileSystem.deleteAsync(target, { idempotent: true });
        await FileSystem.moveAsync({ from: uri, to: target });
        finalUri = target;
      } catch {}

      if (!(await Sharing.isAvailableAsync())) {
        return Alert.alert('PDF gerado', `Arquivo salvo em:\n${finalUri}`);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Sharing.shareAsync(finalUri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Salvar ou compartilhar relatório',
      });
    } catch (e: any) {
      console.error('downloadPdf error:', e);
      Alert.alert('Erro', `Não foi possível gerar o PDF.\n\n${e?.message ?? ''}`);
    } finally {
      setExportingPdf(false);
    }
  };

  const hasResult = Boolean(summary || attention || nextStep);
 
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
 
      <View style={styles.ambientGlow1} />
      <View style={styles.ambientGlow2} />
 
      <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoDot} />
          <Text style={styles.title}>Desburocrata</Text>
        </View>
        <View style={styles.headerBadge}>
          <View style={styles.headerBadgeDot} />
          <Text style={styles.headerBadgeText}>IA Ativa</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderTouchable}>
            
            <View style={styles.previewContent}>
              {selectedFiles.length > 0 ? (
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={{ width: '100%' }}
                  onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
                  onMomentumScrollEnd={(e) =>
                    pageWidth && setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / pageWidth))
                  }
                >
                  {selectedFiles.map((file, index) => (
                    <View key={`${file.uri}-${index}`} style={[styles.page, pageWidth ? { width: pageWidth } : null]}>
                      {file.isImage ? (
                        <View style={styles.imageWrapper}>
                          <Image source={{ uri: file.uri }} style={styles.image} />
                          <LinearGradient colors={['transparent', 'rgba(7,7,16,0.7)']} style={styles.imageOverlay} />
                          <View style={[styles.corner, styles.cornerTL]} />
                          <View style={[styles.corner, styles.cornerTR]} />
                          <View style={[styles.corner, styles.cornerBL]} />
                          <View style={[styles.corner, styles.cornerBR]} />
                          <View style={styles.imageInfo}>
                            <View style={styles.capturedBadge}>
                              <View style={styles.capturedDot} />
                              <Text style={styles.capturedBadgeText}>Capturado</Text>
                            </View>
                            <Text style={styles.imageInfoTitle}>
                              {selectedFiles.length > 1 ? `Imagem ${index + 1}` : 'Documento pronto'}
                            </Text>
                            <Text style={styles.imageInfoSub}>
                              {loading ? 'Analisando com IA…' : hasResult ? 'Análise concluída' : 'Pronto para analisar'}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <LinearGradient colors={[THEME.surface, THEME.card]} style={styles.documentPreview}>
                          <View style={styles.documentIconWrap}>
                            <Ionicons name="document-text" size={52} color={THEME.accent} />
                          </View>
                          <Text style={styles.fileName} numberOfLines={2}>{file.name}</Text>
                          <View style={styles.fileTypePill}>
                            <Text style={styles.fileTypePillText}>
                              {file.name.split('.').pop()?.toUpperCase() ?? 'DOC'}
                            </Text>
                          </View>
                        </LinearGradient>
                      )}

                      <TouchableOpacity
                        style={styles.removeOneButton}
                        onPress={() => removeFileAt(index)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.scannerFrameOuter}>
                    <View style={styles.scannerFrameInner} />
                    <ScanLine />
                    <View style={[styles.scanCorner, styles.scanCornerTL]} />
                    <View style={[styles.scanCorner, styles.scanCornerTR]} />
                    <View style={[styles.scanCorner, styles.scanCornerBL]} />
                    <View style={[styles.scanCorner, styles.scanCornerBR]} />
                  </View>
                  <Text style={styles.emptyTitle}>Selecione um{'\n'}documento</Text>
                  <Text style={styles.emptyHint}>Use a câmera, galeria ou arquivos do dispositivo</Text>
                </View>
              )}
            </View>

            {/* Botão de Fechar flutuante */}
            {selectedFiles.length > 0 && (
              <>
                <TouchableOpacity style={styles.closeFileButton} onPress={removeSelectedFile} activeOpacity={0.7}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
                {selectedFiles.length > 1 && (
                  <View style={styles.counterBadge}>
                    <Text style={styles.counterBadgeText}>
                      {Math.min(currentIndex + 1, selectedFiles.length)}/{selectedFiles.length}
                    </Text>
                  </View>
                )}
              </>
            )}
 
            {/* ── Barra de Ações Inferior Fixa ── */}
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.sideButton} onPress={pickImageFromGallery} activeOpacity={0.75}>
                <Ionicons name="images-outline" size={22} color={THEME.textSoft} />
                <Text style={styles.sideButtonLabel}>Galeria</Text>
              </TouchableOpacity>
 
              <View style={styles.shutterWrap}>
                <PulseRing color={THEME.primary} />
                <TouchableOpacity style={styles.shutterButton} onPress={takePhoto} activeOpacity={0.85}>
                  <LinearGradient colors={[THEME.primary, '#5B4FE8']} style={styles.shutterGradient}>
                    <Ionicons name="camera" size={30} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
 
              <TouchableOpacity style={styles.sideButton} onPress={pickDocument} activeOpacity={0.75}>
                <Ionicons name="document-outline" size={22} color={THEME.textSoft} />
                <Text style={styles.sideButtonLabel}>Arquivo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
 
        {/* ── Botão Analisar ── */}
        {selectedFiles.length > 0 && !loading && !hasResult && (
          <TouchableOpacity style={styles.analyzeButton} onPress={analyzeFile} activeOpacity={0.85}>
            <LinearGradient
              colors={[THEME.accent, '#00B89C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.resetGradient}
            >
              <Ionicons name="sparkles-outline" size={20} color="#070710" />
              <Text style={[styles.resetButtonText, { color: '#070710' }]}>
                {selectedFiles.length > 1 ? `Analisar ${selectedFiles.length} arquivos` : 'Analisar documento'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {selectedFiles.length > 0 && !loading && !hasResult && (
          <Text style={styles.addMoreHint}>
            Dica: toque em Galeria, Câmera ou Arquivo para adicionar mais imagens antes de analisar.
          </Text>
        )}

        {/* ── Loading com Mensagens Dinâmicas ── */}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingInner}>
              <ActivityIndicator size="small" color={THEME.accent} />
              <Text style={styles.loadingText}>
                {LOADING_MESSAGES[loadingMessageIndex]}
              </Text>
            </View>
            <LoadingDots />
          </View>
        )}
 
        {/* ── Resultados da Análise ── */}
        {hasResult && !loading && (
          <View style={styles.resultContainer}>
            <View style={styles.sectionLabel}>
              <View style={styles.sectionLabelLine} />
              <Text style={styles.sectionLabelText}>ANÁLISE CONCLUÍDA</Text>
              <View style={styles.sectionLabelLine} />
            </View>
 
            <ResultCard
              icon="document-text-outline"
              iconColor={THEME.primary}
              accentColor={THEME.primary}
              title="Resumo"
              text={summary}
              delay={0}
            />
 
            <ResultCard
              icon="warning-outline"
              iconColor={THEME.danger}
              accentColor={THEME.danger}
              title="Atenção"
              text={attention}
              delay={100}
            />
 
            <ResultCard
              icon="arrow-forward-circle-outline"
              iconColor={THEME.success}
              accentColor={THEME.success}
              title="Próximo Passo"
              text={nextStep}
              delay={200}
            />

            {/* ── Botão Baixar PDF ── */}
            <TouchableOpacity
              style={[styles.resetButton, exportingPdf && { opacity: 0.6 }]}
              onPress={downloadPdf}
              disabled={exportingPdf}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[THEME.accent, '#00B89C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resetGradient}
              >
                {exportingPdf ? (
                  <ActivityIndicator size="small" color="#070710" />
                ) : (
                  <Ionicons name="download-outline" size={20} color="#070710" />
                )}
                <Text style={[styles.resetButtonText, { color: '#070710' }]}>
                  {exportingPdf ? 'Gerando PDF…' : 'Baixar relatório em PDF'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={removeSelectedFile} activeOpacity={0.85}>
              <LinearGradient
                colors={[THEME.primary, '#5046E8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resetGradient}
              >
                <Ionicons name="refresh-outline" size={20} color="#fff" />
                <Text style={styles.resetButtonText}>Limpar e Escanear Novo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
 
// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  ambientGlow1: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: THEME.primary,
    opacity: 0.04,
  },
  ambientGlow2: {
    position: 'absolute',
    bottom: 100,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: THEME.accent,
    opacity: 0.03,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 52 : 42,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.accent,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: 0.3,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.accentDim,
    borderWidth: 0.5,
    borderColor: THEME.accent + '33',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: THEME.accent,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.accent,
    letterSpacing: 0.4,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 60,
  },
  viewfinderCard: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: THEME.borderMid,
    backgroundColor: THEME.card,
  },
  viewfinderTouchable: {
    height: 520,
    overflow: 'hidden',
    backgroundColor: '#09090F',
    position: 'relative',
  },
  previewContent: {
    flex: 1,
    width: '100%',
    paddingBottom: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFileButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  page: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeOneButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,90,122,0.55)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBadge: {
    position: 'absolute',
    top: 26,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  counterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  addMoreHint: {
    marginTop: 10,
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    maxWidth: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', 
  },
  imageOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: THEME.accent,
    opacity: 0.9,
  },
  cornerTL: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 6 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 6 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 6 },
  imageInfo: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    right: 18,
  },
  capturedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  capturedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: THEME.success,
  },
  capturedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.success,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  imageInfoTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  imageInfoSub: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
  },
  scanLine: {
    position: 'absolute',
    width: '95%',
    height: 2,
    top: '50%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    paddingTop: 20,
  },
  scannerFrameOuter: {
    width: '85%',  
    height: '65%', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  scannerFrameInner: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(0,229,195,0.01)',
  },
  scanCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: THEME.accent,
  },
  scanCornerTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 4 },
  scanCornerTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 4 },
  scanCornerBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 4 },
  scanCornerBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 4 },
  emptyTitle: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '800',
    color: THEME.text,
    lineHeight: 28,
  },
  emptyHint: {
    marginTop: 6,
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  documentPreview: {
    width: '90%',
    height: '85%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  documentIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: THEME.accentDim,
    borderWidth: 0.5,
    borderColor: THEME.accent + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
    textAlign: 'center',
  },
  fileTypePill: {
    backgroundColor: THEME.primaryDim,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: THEME.primary + '44',
  },
  fileTypePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.primary,
    letterSpacing: 1,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 12,
    gap: 24,
    backgroundColor: 'rgba(9,9,15,0.92)',
    borderTopWidth: 0.5,
    borderTopColor: THEME.borderMid,
  },
  sideButton: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sideButtonLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  shutterWrap: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  shutterGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: THEME.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: THEME.border,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.textSoft,
  },
  resultContainer: {
    marginTop: 24,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionLabelLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: THEME.border,
  },
  sectionLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textMuted,
    letterSpacing: 2,
  },
  resultCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: THEME.border,
    borderLeftWidth: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.04,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  copyButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.textSoft,
  },
  resetButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  resetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});