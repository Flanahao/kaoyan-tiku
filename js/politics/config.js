/**
 * 考研政治知识图谱 - 全局基础配置
 * Milestone 0 + 1
 */
window.PoliticsConfig = {
  version: 1,

  layout: {
    centerX: 0,
    firstLaneOffset: 260,
    laneWidth: 920,
    depthIndent: 210,
    nodeMinGap: 48,
    periodGap: 140,
    timelineTop: 120,
    localGap: 62
  },

  nodeSizes: {
    book: [180, 44],
    chapter: [170, 38],
    section: [160, 34],
    point: [176, 32]
  },

  zoom: {
    min: 0.15,
    max: 2.0,
    default: 0.75,
    step: 0.15
  },

  bookColors: {
    sg:  { main: '#C026D3', border: '#A21CAF', bg: '#FDF4FF', text: '#701A75', bar: '#C026D3' }, // 史纲
    my:  { main: '#2563EB', border: '#1D4ED8', bg: '#EFF6FF', text: '#1E3A8A', bar: '#2563EB' }, // 马原
    mzt: { main: '#EA580C', border: '#C2410C', bg: '#FFF7ED', text: '#7C2D12', bar: '#EA580C' }, // 毛中特
    xs:  { main: '#0D9488', border: '#0F766E', bg: '#F0FDFA', text: '#134E4A', bar: '#0D9488' }, // 当代
    xg:  { main: '#DC2626', border: '#B91C1C', bg: '#FEF2F2', text: '#7F1D1D', bar: '#DC2626' }, // 习概
    sx:  { main: '#4F46E5', border: '#4338CA', bg: '#EEF2FF', text: '#312E81', bar: '#4F46E5' }  // 思法
  },

  relationStyles: {
    theory_application: { color: '#8B5CF6', lineDash: [5, 4], label: '理论应用' },
    historical_context: { color: '#059669', lineDash: [4, 4], label: '历史印证' },
    evolution:          { color: '#D97706', lineDash: [6, 3], label: '理论演变' },
    cause:              { color: '#EF4444', lineDash: [4, 3], label: '因果溯源' },
    compare:            { color: '#6366F1', lineDash: [5, 5], label: '比较辨析' },
    default:            { color: '#64748B', lineDash: [4, 4], label: '关联' }
  },

  storageKeys: {
    learning: 'user_guest_politics_learning_v1',
    view: 'user_guest_politics_view_v1',
    preferences: 'user_guest_politics_preferences_v1'
  }
};
