import React, { useState, useEffect, useCallback } from 'react';
import request from '../utils/request';
import { useCart } from '../pages/CartContext';

const TrainInfo = ({ visible, onClose, onSelectTrain, externalStation, onSelectStation }) => {
    const [loading, setLoading] = useState(false);
    const [trains, setTrains] = useState([]);
    const [filteredTrains, setFilteredTrains] = useState([]);
    const [selectedStation, setSelectedStation] = useState(externalStation || '');
    const [stations, setStations] = useState([]);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        onTime: 0,
        delayed: 0,
        cancelled: 0,
        arrived: 0
    });

    const { setTrainForOrder } = useCart();

    useEffect(() => {
        if (externalStation !== undefined) {
            setSelectedStation(externalStation);
            
        }
    }, [externalStation]);

    const extractStations = (trainData) => {
        const stationSet = new Set();
        trainData.forEach(train => {
            if (train.currentStation && train.currentStation !== 'Unknown') {
                stationSet.add(train.currentStation);
            }
        });
        return Array.from(stationSet).sort();
    };

    const isValidStationName = (stationName) => {
        if (!stationName) return false;
        if (stationName === 'Unknown') return false;
        if (stationName.startsWith('Station ')) return false;
        if (/^[0-9]{5,}$/.test(stationName)) return false;
        if (/^[A-Z0-9]{8,}$/.test(stationName)) return false;
        return true;
    };

    const fetchTrains = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await request.get('/raildata/trains');
            let data = response.data || response || [];

            if (!Array.isArray(data)) {
                data = [];
            }

            const validTrains = data.filter(train => {
                const hasArrivalTime =
                    train.scheduledArrivalTime ||
                    train.estimatedArrivalTime ||
                    train.actualArrivalTime;

                const isValidStation = isValidStationName(train.currentStation);

                return hasArrivalTime && isValidStation;
            });

            const sortedData = [...validTrains].sort((a, b) => {
                const timeA = new Date(a.scheduledArrivalTime || a.estimatedArrivalTime);
                const timeB = new Date(b.scheduledArrivalTime || b.estimatedArrivalTime);
                return timeA - timeB;
            });

            setTrains(sortedData);
            setFilteredTrains(sortedData);

            const stationList = extractStations(sortedData);
            setStations(stationList);

            setLastUpdated(new Date().toLocaleTimeString());

            const total = sortedData.length;

            let onTime = 0;
            let delayed = 0;
            let cancelled = 0;
            let early = 0;

            sortedData.forEach(train => {
                const statusText = getStatusText(train);

                const scheduled = new Date(train.scheduledArrivalTime);
                const actual = train.actualArrivalTime ? new Date(train.actualArrivalTime) : null;

                if (actual && scheduled && actual < scheduled) {
                    early++;
                } else if (statusText.startsWith('Delayed')) {
                    delayed++;
                } else if (statusText === 'Cancelled') {
                    cancelled++;
                } else {
                    onTime++;
                }
            });

            setStats({
                total,
                onTime,
                delayed,
                cancelled,
                arrived: early
            });
        } catch (err) {
            console.error('Failed to fetch train data:', err);
            setError('Failed to fetch train data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!selectedStation) {
            setFilteredTrains(trains);
        } else {
            const filtered = trains.filter(train =>
                train.currentStation === selectedStation
            );
            setFilteredTrains(filtered);
        }
    }, [selectedStation, trains]);

    useEffect(() => {
        if (visible) {
            fetchTrains();
            const interval = setInterval(fetchTrains, 60000);
            return () => clearInterval(interval);
        }
    }, [visible, fetchTrains]);

    const getStatusColor = (record) => {
        switch (record.status) {
            case 'ARRIVED': return '#52c41a';
            case 'ON_TIME': return '#52c41a';
            case 'DELAYED': return '#faad14';
            case 'CANCELLED': return '#ff4d4f';
            default: return '#8c8c8c';
        }
    };

    const getStatusText = (record) => {
        switch (record.status) {
            case 'ARRIVED':
                return 'Arrived';
            case 'ON_TIME':
                return 'On Time';
            case 'DELAYED':
                return `Delayed ${record.delayMinutes || ''}min`;
            case 'CANCELLED':
                return 'Cancelled';
            default:
                return record.status || 'Unknown';
        }
    };

    const calculatePreparationTime = (train) => {
        let baseTime = 5;

        if (train.actualArrivalTime || train.status === 'ARRIVED') {
            return 0;
        }

        if (train.status === 'DELAYED') {
            const delay = train.delayMinutes || 0;
            if (delay <= 5) return baseTime;
            if (delay <= 15) return baseTime + 5;
            return baseTime + delay;
        }

        if (train.status === 'CANCELLED') {
            return -1;
        }

        return baseTime;
    };

    const handleStationChange = (station) => {
        setSelectedStation(station);
        if (onSelectStation) {
            onSelectStation(station);
        }
    };

    const handleOrderCoffee = (train) => {
        const prepTime = calculatePreparationTime(train);

        if (prepTime === -1) {
            alert(`Train ${train.trainId} is CANCELLED. Cannot place order.`);
            return;
        }

        setTrainForOrder({
            trainId: train.trainId,
            currentStation: train.currentStation,
            arrivalTime: train.scheduledArrivalTime,
            status: getStatusText(train),
            platform: train.platform
        });

        let message = `Order placed for train ${train.trainId}\n`;
        message += `Current: ${train.currentStation}\n`;
        message += `Status: ${getStatusText(train)}\n`;

        if (prepTime === 0) {
            message += `Train has ARRIVED! Order will be ready NOW.`;
        } else {
            message += `Order will be ready in ${prepTime} minutes (adjusted for train status).`;
        }

        alert(message);

        if (onSelectTrain) {
            onSelectTrain({ ...train, estimatedReadyMinutes: prepTime });
        }
    };

    if (!visible) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Train Information</h2>
                    <button onClick={onClose} style={styles.closeBtn}>X</button>
                </div>

                <div style={styles.statsContainer}>
                    <div style={styles.statCard}>
                        <div style={styles.statValue}>{stats.total}</div>
                        <div style={styles.statLabel}>Total</div>
                    </div>
                    <div style={{...styles.statCard, borderBottomColor: '#52c41a'}}>
                        <div style={{...styles.statValue, color: '#52c41a'}}>{stats.onTime}</div>
                        <div style={styles.statLabel}>On Time</div>
                    </div>
                    <div style={{...styles.statCard, borderBottomColor: '#faad14'}}>
                        <div style={{...styles.statValue, color: '#faad14'}}>{stats.delayed}</div>
                        <div style={styles.statLabel}>Delayed</div>
                    </div>
                    <div style={{...styles.statCard, borderBottomColor: '#52c41a'}}>
                        <div style={{...styles.statValue, color: '#52c41a'}}>{stats.arrived}</div>
                        <div style={styles.statLabel}>Early</div>
                    </div>
                </div>

                <div style={styles.stationSelector}>
                    <label style={styles.label}>Select your current station:</label>
                    <select
                        value={selectedStation}
                        onChange={(e) => handleStationChange(e.target.value)}
                        style={styles.stationSelect}
                    >
                        <option value="">All Stations</option>
                        {stations.map(station => (
                            <option key={station} value={station}>{station}</option>
                        ))}
                    </select>
                    <button onClick={fetchTrains} style={styles.refreshBtn}>Refresh</button>
                </div>

                {selectedStation && (
                    <div style={styles.infoNote}>
                        Showing trains at <strong>{selectedStation}</strong>
                        <br />
                        Order preparation time automatically adjusts based on train status
                    </div>
                )}

                <div style={styles.updateTime}>Last updated: {lastUpdated || '--'}</div>

                {error && <div style={styles.errorMsg}>Error: {error}</div>}

                {loading && <div style={styles.loading}>Loading...</div>}

                {!loading && (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Train ID</th>
                                <th style={styles.th}>Current Station</th>
                                <th style={styles.th}>Arrival Time</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Platform</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTrains.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={styles.noData}>
                                        {selectedStation ? `No trains found at ${selectedStation}` : 'No trains found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTrains.map(train => (
                                    <tr key={train.id} style={styles.tableRow}>
                                        <td style={styles.td}><strong>{train.trainId || 'Unknown'}</strong></td>
                                        <td style={styles.td}>{train.currentStation || 'Unknown'}</td>
                                        <td style={styles.td}>
                                            {train.scheduledArrivalTime
                                                ? new Date(train.scheduledArrivalTime).toLocaleTimeString('en-GB', { hour12: false })
                                                : '--'}
                                            {train.actualArrivalTime && (
                                                <div style={{ fontSize: '11px', color: '#52c41a' }}>
                                                    Arrived: {new Date(train.actualArrivalTime).toLocaleTimeString('en-GB', { hour12: false })}
                                                </div>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                                <span style={{...styles.statusBadge, backgroundColor: getStatusColor(train)}}>
                                                    {getStatusText(train)}
                                                </span>
                                        </td>
                                        <td style={styles.td}>{train.platform?.trim() || 'TBC'}</td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => handleOrderCoffee(train)}
                                                disabled={train.status === 'CANCELLED'}
                                                style={{
                                                    ...styles.orderBtn,
                                                    opacity: train.status === 'CANCELLED' ? 0.5 : 1,
                                                    cursor: train.status === 'CANCELLED' ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                Order Coffee
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={styles.footerNote}>
                    Smart Order Strategy: On Time -&gt; 5min prep | Delayed -&gt; adjusted prep | Arrived -&gt; immediate | Cancelled -&gt; blocked
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1000px',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '20px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #e8e8e8'
    },
    title: { margin: 0, fontSize: '20px', color: '#6F4E37' },
    closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999', padding: '0 8px' },
    statsContainer: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
    statCard: { flex: 1, minWidth: '100px', padding: '16px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px', borderBottom: '3px solid #1890ff' },
    statValue: { fontSize: '28px', fontWeight: 'bold', color: '#1890ff' },
    statLabel: { fontSize: '12px', color: '#666', marginTop: '8px' },
    stationSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        flexWrap: 'wrap'
    },
    label: { fontWeight: 'bold', color: '#333' },
    stationSelect: {
        flex: 1,
        minWidth: '200px',
        padding: '8px 12px',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white'
    },
    refreshBtn: { padding: '8px 16px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    infoNote: {
        padding: '10px 12px',
        backgroundColor: '#e6f7ff',
        border: '1px solid #91d5ff',
        borderRadius: '6px',
        marginBottom: '12px',
        fontSize: '13px',
        color: '#0050b3'
    },
    updateTime: { textAlign: 'right', fontSize: '12px', color: '#999', marginBottom: '16px' },
    errorMsg: { padding: '12px', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '6px', color: '#ff4d4f', marginBottom: '16px' },
    loading: { textAlign: 'center', padding: '40px', color: '#999' },
    tableContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    tableHeader: { backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8' },
    th: { padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#666' },
    tableRow: { borderBottom: '1px solid #f0f0f0' },
    td: { padding: '12px', verticalAlign: 'top' },
    statusBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', color: 'white' },
    orderBtn: { padding: '4px 12px', backgroundColor: '#6F4E37', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px' },
    noData: { textAlign: 'center', padding: '40px', color: '#999' },
    footerNote: {
        marginTop: '16px',
        padding: '10px',
        backgroundColor: '#f6ffed',
        border: '1px solid #b7eb8f',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#389e0d',
        textAlign: 'center'
    }
};

export default TrainInfo;