export function toChartMemberResponse(m) {
    return {
        memberChartId: m.memberChartId,
        chartId: m.chartId,
        userId: m.userId,
        jabatan: m.jabatan ?? null,
    };
}
//# sourceMappingURL=chart-member-model.js.map