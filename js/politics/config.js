/** Politics V1.1 visual/config baseline */
window.PoliticsConfig = {
  version: 2,

  layout: {
    centerX: 0,

    timelineTop: 160,
    timelineRootGap: 96,
    timelineChapterGap: 128,
    periodGap: 86,

    sgBranchOffset: 310,

    bookBaseOffset: 760,
    bookLaneStep: 360,

    depthIndent: 238,

    branchLeafGap: 54,
    branchPadding: 32,
    branchGap: 34,
    minNodeGap: 18
  },

  nodeSizes: {
    book: [164, 42],
    chapter: [228, 44],
    section: [206, 38],
    point: [226, 34]
  },

  zoom: {
    min: 0.18,
    max: 1.8,
    default: 0.72,
    step: 0.12
  },

  bookColors: {
    sg: {
      main: '#2563EB',
      pale: '#EFF6FF',
      text: '#1E3A8A'
    },

    my: {
      main: '#7C3AED',
      pale: '#F5F3FF',
      text: '#5B21B6'
    },

    mzt: {
      main: '#EA580C',
      pale: '#FFF7ED',
      text: '#9A3412'
    },

    xs: {
      main: '#0D9488',
      pale: '#F0FDFA',
      text: '#115E59'
    },

    xg: {
      main: '#16A34A',
      pale: '#F0FDF4',
      text: '#166534'
    },

    sx: {
      main: '#DB2777',
      pale: '#FDF2F8',
      text: '#9D174D'
    }
  },

  relationStyles: {
    theory_application: { color: '#7C3AED' },
    historical_context: { color: '#0D9488' },
    evolution: { color: '#D97706' },
    cause: { color: '#DC2626' },
    result: { color: '#0284C7' },
    compare: { color: '#4F46E5' },
    same_topic: { color: '#2563EB' },
    related: { color: '#64748B' },
    default: { color: '#94A3B8' }
  }
};
