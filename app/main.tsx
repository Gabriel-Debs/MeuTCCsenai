import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
 
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
 
const GEMINI_API_KEY = 'AQ.Ab8RN6K0lo99yPyixv12nVu7ElWySAskvcqHaVC2ndnZVp4JZQ';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
 
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
    // await Clipboard.setStringAsync(text);
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
    <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} pointerEvents="none">
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
 
// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [attention, setAttention] = useState('');
  const [nextStep, setNextStep] = useState('');
 
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-12)).current;
 
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerY, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);
 
  useEffect(() => {
    if (selectedFile) analyzeFile();
  }, [selectedFile]);
 
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, 
      quality: 0.9,
      base64: true,
    });
    processFileResult(result, true);
  };
 
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const file = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      toggleAnimation();
      setSelectedFile({
        uri: file.uri,
        base64,
        mimeType: file.mimeType || 'application/octet-stream',
        name: file.name,
        isImage: false,
      });
      resetResult();
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar o documento.');
    }
  };
 
  const processFileResult = (result: any, isImage: boolean) => {
    if (!result.canceled && result.assets) {
      const asset = result.assets[0];
      toggleAnimation();
      setSelectedFile({
        uri: asset.uri,
        base64: asset.base64 || '',
        mimeType: isImage ? 'image/jpeg' : asset.mimeType || 'application/pdf',
        name: isImage ? 'documento.jpg' : asset.name || 'arquivo',
        isImage,
        aspectRatio: asset.width && asset.height ? asset.width / asset.height : undefined,
      });
      resetResult();
    }
  };
 
  const analyzeFile = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
Explique o documento como se estivesse falando com uma pessoa comum.
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
                  {
                    inline_data: {
                      mime_type: selectedFile.mimeType,
                      data: selectedFile.base64,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        Alert.alert('Erro', 'Não foi possível analisar o documento. Verifique sua chave API.');
        return;
      }
      parseAIResponse(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Erro', 'Erro de conexão com a IA.');
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
    setSelectedFile(null);
    resetResult();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
 
  const hasResult = summary || attention || nextStep;
 
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
 
      <View style={styles.ambientGlow1} />
      <View style={styles.ambientGlow2} />
 
      {/* ── Header ── */}
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
        {/* ── Viewfinder Card ── */}
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderTouchable}>
            
            <View style={styles.previewContent}>
              {selectedFile ? (
                <>
                  {selectedFile.isImage ? (
                    <View style={[
                      styles.imageWrapper, 
                      selectedFile.aspectRatio ? { aspectRatio: selectedFile.aspectRatio } : null
                    ]}>
                      <Image source={{ uri: selectedFile.uri }} style={styles.image} />
                      <LinearGradient colors={['transparent', 'rgba(7,7,16,0.7)']} style={styles.imageOverlay} />
                       
                      {/* As grades agora mapeiam cirurgicamente as bordas reais do arquivo */}
                      <View style={[styles.corner, styles.cornerTL]} />
                      <View style={[styles.corner, styles.cornerTR]} />
                      <View style={[styles.corner, styles.cornerBL]} />
                      <View style={[styles.corner, styles.cornerBR]} />
 
                      <View style={styles.imageInfo}>
                        <View style={styles.capturedBadge}>
                          <View style={styles.capturedDot} />
                          <Text style={styles.capturedBadgeText}>Capturado</Text>
                        </View>
                        <Text style={styles.imageInfoTitle}>Documento pronto</Text>
                        <Text style={styles.imageInfoSub}>
                          {loading ? 'Analisando com IA…' : 'Análise concluída'}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <LinearGradient colors={[THEME.surface, THEME.card]} style={styles.documentPreview}>
                      <View style={styles.documentIconWrap}>
                        <Ionicons name="document-text" size={52} color={THEME.accent} />
                      </View>
                      <Text style={styles.fileName} numberOfLines={2}>{selectedFile.name}</Text>
                      <View style={styles.fileTypePill}>
                        <Text style={styles.fileTypePillText}>
                          {selectedFile.name.split('.').pop()?.toUpperCase() ?? 'DOC'}
                        </Text>
                      </View>
                    </LinearGradient>
                  )}
                </>
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
            {selectedFile && (
              <TouchableOpacity style={styles.closeFileButton} onPress={removeSelectedFile} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
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
 
        {/* ── Loading ── */}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingInner}>
              <ActivityIndicator size="small" color={THEME.accent} />
              <Text style={styles.loadingText}>Analisando com IA</Text>
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
    paddingBottom: 88, // Desvincula o cálculo do topo da barra inferior fixa
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