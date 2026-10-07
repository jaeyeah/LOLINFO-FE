export const BOARD_PAGES = {
    hub: {
        path: '/board', label: '전체', heading: 'SOOPLOL 이야기',
        title: 'SOOPLOL 이야기 | CK·대회·스트리머 콘텐츠',
        description: 'SOOP LoL의 CK, 대회와 스트리머 방송에서 만들어진 문화와 주요 기록을 정리합니다. 월간 소식과 이야기를 살펴보고, 서비스에 접수된 공개 피드백도 확인할 수 있습니다.',
    },
    news: {
        path: '/board/news', label: '월간 소식', heading: 'SOOPLOL 월간 소식',
        title: 'SOOPLOL 월간 소식 | CK·대회 활동 정리',
        description: '월별 CK 활동과 대회 진행 상황, 주요 기록의 변화를 정리합니다. 각 월의 소식을 통해 SOOP LoL에서 이어진 경기와 방송의 흐름을 살펴보세요.',
    },
    story: {
        path: '/board/story', label: '이야기', heading: 'SOOPLOL 이야기',
        title: 'CK 이야기와 방송 문화 | SOOPLOL',
        description: 'SOOP LoL의 CK와 멸망전, 스트리머 방송에서 만들어진 문화와 주요 이야기를 기록합니다. 경기 결과와 함께 방송을 즐기는 데 도움이 되는 배경과 맥락을 소개합니다.',
    },
    feedback: {
        path: '/board/feedback', label: '피드백', heading: 'SOOPLOL 공개 피드백',
        title: '공개 피드백 및 처리 현황 | SOOPLOL',
        description: 'SOOPLOL에 접수된 공개 피드백과 처리 현황을 확인할 수 있습니다. 기록의 오류·누락 제보와 서비스 개선 의견이 어떻게 처리되고 있는지 살펴보세요.',
    },
};
export const LEGACY_BOARD_TABS = { monthly: '/board/news', blog: '/board/story', feedback: '/board/feedback' };
export const getBoardCategoryPath = (category) => category === 'blog' ? '/board/story' : category === '정보' ? '/board/news' : '/board';
export const getBoardCategoryLabel = (category) => category === 'blog' ? '이야기' : category === '정보' ? '월간 소식' : category;
