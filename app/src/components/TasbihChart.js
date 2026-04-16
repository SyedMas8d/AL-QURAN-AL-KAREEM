import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TasbihChart({ dailyHistory, title = 'திக்ர் முன்னேற்ற அட்டவணை' }) {
    const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'

    // Get screen width inside component to avoid initialization issues
    const screenWidth = Dimensions.get('window').width;

    // Get last 5 days including today
    const getLast5Days = () => {
        const today = new Date();
        const days = [];

        // Tamil weekday names for fallback
        const tamilDays = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

        for (let i = 4; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            // Safe date formatting with fallback
            let dayName;
            try {
                dayName = date.toLocaleDateString('ta', { weekday: 'short' });
            } catch (error) {
                // Fallback to Tamil day names if locale is not supported
                const dayIndex = date.getDay();
                dayName = tamilDays[dayIndex].substring(0, 3); // First 3 characters
            }

            days.push({
                date: date.toDateString(),
                shortDate: date.getDate().toString(),
                dayName: dayName,
                isToday: i === 0,
            });
        }
        return days;
    };

    const days = getLast5Days();
    const data = days.map((day) => ({
        ...day,
        count: dailyHistory[day.date] || 0,
    }));

    // Calculate Y-axis scale based on max count
    const maxCount = Math.max(...data.map((d) => d.count), 0);
    const getYAxisScale = (max) => {
        if (max <= 100) return { max: 100, step: 20 }; // 0-20-40-60-80-100
        if (max <= 150) return { max: 150, step: 30 }; // 0-30-60-90-120-150
        return { max: Math.ceil(max / 50) * 50, step: 50 }; // 0-50-100-150-200...
    };

    const scale = getYAxisScale(maxCount);
    const yAxisLabels = [];
    for (let i = 0; i <= scale.max; i += scale.step) {
        yAxisLabels.push(i);
    }

    // Calculate statistics
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const average = data.length > 0 ? Math.round(total / data.length) : 0;
    const completedDays = data.filter((d) => d.count >= 100).length;
    const peak = maxCount;

    const renderBarChart = () => {
        const chartWidth = screenWidth - 80; // Account for margins
        const chartHeight = 200;
        const barWidth = Math.max(30, (chartWidth - 40) / data.length - 10);

        return (
            <View style={styles.chartContainer}>
                {/* Y-Axis Labels */}
                <View style={styles.yAxisContainer}>
                    {yAxisLabels.reverse().map((label, index) => (
                        <View key={index} style={[styles.yAxisLabel, { height: chartHeight / yAxisLabels.length }]}>
                            <Text style={styles.yAxisText}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* Chart Area */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollView}>
                    <View style={[styles.chartArea, { minWidth: screenWidth - 110, height: chartHeight }]}>
                        {/* Horizontal Grid Lines */}
                        {yAxisLabels.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.gridLine, { top: (chartHeight / yAxisLabels.length) * index }]}
                            />
                        ))}

                        {/* Bars */}
                        <View style={styles.barsContainer}>
                            {data.map((item, index) => {
                                const barHeight = scale.max > 0 ? (item.count / scale.max) * chartHeight : 0;
                                const isCompleted = item.count >= 100;

                                return (
                                    <View key={index} style={[styles.barContainer, { width: barWidth + 10 }]}>
                                        {/* Bar */}
                                        <View style={styles.barWrapper}>
                                            <View
                                                style={[
                                                    styles.bar,
                                                    {
                                                        height: Math.max(barHeight, 2), // Minimum 2px height
                                                        width: barWidth,
                                                        backgroundColor: isCompleted
                                                            ? '#4CAF50'
                                                            : item.count > 50
                                                              ? '#FF9800'
                                                              : '#FF6B6B',
                                                    },
                                                ]}
                                            />
                                        </View>

                                        {/* Count Label */}
                                        {item.count > 0 && (
                                            <Text style={[styles.countLabel, { bottom: Math.max(barHeight + 5, 10) }]}>
                                                {item.count}
                                            </Text>
                                        )}

                                        {/* Date Label */}
                                        <View style={styles.dateLabel}>
                                            <Text style={styles.dateText}>{item.dayName}</Text>
                                            <Text style={[styles.dateNumber, item.isToday && styles.todayDate]}>
                                                {item.shortDate}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderProgressView = () => {
        return (
            <View style={styles.progressContainer}>
                {data.map((item, index) => {
                    const progressPercentage = Math.min((item.count / 100) * 100, 100);
                    const isCompleted = item.count >= 100;

                    return (
                        <View key={index} style={styles.progressItem}>
                            <View style={styles.progressHeader}>
                                <View style={styles.progressDate}>
                                    <Text style={styles.progressDateText}>
                                        {item.dayName} {item.shortDate}
                                    </Text>
                                    {item.isToday && (
                                        <View style={styles.todayBadge}>
                                            <Text style={styles.todayBadgeText}>இன்று</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.progressCount, { color: isCompleted ? '#4CAF50' : '#666' }]}>
                                    {item.count}/100
                                </Text>
                            </View>

                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${progressPercentage}%`,
                                            backgroundColor: isCompleted
                                                ? '#4CAF50'
                                                : item.count > 50
                                                  ? '#FF9800'
                                                  : '#FF6B6B',
                                        },
                                    ]}
                                />
                            </View>

                            {isCompleted && (
                                <View style={styles.completedBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                    <Text style={styles.completedText}>முடிந்தது!</Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="analytics" size={24} color="#4CAF50" />
                    <Text style={styles.title}>{title}</Text>
                </View>

                <View style={styles.chartTypeButtons}>
                    <TouchableOpacity
                        style={[styles.chartTypeButton, chartType === 'bar' && styles.activeButton]}
                        onPress={() => setChartType('bar')}
                    >
                        <Ionicons name="bar-chart" size={16} color={chartType === 'bar' ? '#fff' : '#4CAF50'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chartTypeButton, chartType === 'line' && styles.activeButton]}
                        onPress={() => setChartType('line')}
                    >
                        <Ionicons name="list" size={16} color={chartType === 'line' ? '#fff' : '#4CAF50'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chart */}
            {chartType === 'bar' ? renderBarChart() : renderProgressView()}

            {/* Statistics */}
            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>புள்ளிவிவரங்கள் (கடைசி 5 நாட்கள்)</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{total}</Text>
                        <Text style={styles.statLabel}>மொத்தம்</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{average}</Text>
                        <Text style={styles.statLabel}>சராசரி</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{completedDays}</Text>
                        <Text style={styles.statLabel}>முடிந்த நாட்கள்</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{peak}</Text>
                        <Text style={styles.statLabel}>மிக அதிகம்</Text>
                    </View>
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.legendText}>100+ (முடிந்தது)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
                    <Text style={styles.legendText}>50-99 (நடுநிலை)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
                    <Text style={styles.legendText}>0-49 (குறைவு)</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    chartTypeButtons: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        padding: 2,
    },
    chartTypeButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
    },
    activeButton: {
        backgroundColor: '#4CAF50',
    },
    chartContainer: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 8,
    },
    yAxisContainer: {
        width: 30,
        height: 200,
        justifyContent: 'space-between',
    },
    yAxisLabel: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingRight: 5,
    },
    yAxisText: {
        fontSize: 10,
        color: '#666',
    },
    chartScrollView: {
        flex: 1,
    },
    chartArea: {
        position: 'relative',
        // minWidth moved to inline style to access screenWidth variable
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: '100%',
        paddingHorizontal: 10,
    },
    barContainer: {
        alignItems: 'center',
        position: 'relative',
        height: '100%',
    },
    barWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
    },
    bar: {
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        minHeight: 2,
    },
    countLabel: {
        position: 'absolute',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    dateLabel: {
        position: 'absolute',
        bottom: -35,
        alignItems: 'center',
    },
    dateText: {
        fontSize: 9,
        color: '#666',
        marginBottom: 2,
    },
    dateNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    todayDate: {
        color: '#4CAF50',
    },
    progressContainer: {
        padding: 16,
    },
    progressItem: {
        marginBottom: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressDate: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressDateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
    },
    todayBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    todayBadgeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    progressCount: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    completedText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
        marginLeft: 4,
    },
    statsContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        paddingTop: 8,
        backgroundColor: '#f8f9fa',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 4,
    },
    legendText: {
        fontSize: 10,
        color: '#666',
    },
});
