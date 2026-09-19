export const formatRate = (value) => value == null ? "데이터 없음" : `${value.toFixed(1)}%`;
export const formatChange = (value) => {
    if (value == null) return "—";
    const rounded = Number(value.toFixed(1));
    return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}%p`;
};
