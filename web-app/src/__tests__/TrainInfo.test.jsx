import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TrainInfo from '../components/TrainInfo';
import request from '../utils/request';

vi.mock('../utils/request', () => ({
    default: {
        get: vi.fn(),
    },
}));

const mockSetTrainForOrder = vi.fn();

vi.mock('../pages/CartContext', () => ({
    useCart: () => ({
        setTrainForOrder: mockSetTrainForOrder,
    }),
}));

describe('TrainInfo Component', () => {
    const mockOnClose = vi.fn();
    const mockOnSelectTrain = vi.fn();
    const mockOnSelectStation = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render when visible is false', () => {
        render(
            <TrainInfo
                visible={false}
                onClose={mockOnClose}
                onSelectTrain={mockOnSelectTrain}
            />
        );

        expect(screen.queryByText('Train Information')).not.toBeInTheDocument();
    });

    it('renders train modal when visible is true', async () => {
        request.get.mockResolvedValueOnce({ data: ['Newcastle'] });
        request.get.mockResolvedValueOnce({ data: [] });

        render(
            <TrainInfo
                visible={true}
                onClose={mockOnClose}
                onSelectTrain={mockOnSelectTrain}
            />
        );

        expect(screen.getByText('Train Information')).toBeInTheDocument();
        expect(screen.getByText('Select your current station:')).toBeInTheDocument();
        expect(screen.getByText('Refresh')).toBeInTheDocument();

        await waitFor(() => {
            expect(request.get).toHaveBeenCalledWith('/raildata/stations');
        });
    });

    it('loads and displays train data', async () => {
        request.get.mockResolvedValueOnce({ data: ['Newcastle'] });
        request.get.mockResolvedValueOnce({
            data: [
                {
                    id: 1,
                    trainId: 'T123',
                    currentStation: 'Newcastle',
                    scheduledArrivalTime: '2026-05-02T10:00:00Z',
                    status: 'ON_TIME',
                    platform: '2',
                },
            ],
        });

        render(
            <TrainInfo
                visible={true}
                onClose={mockOnClose}
                onSelectTrain={mockOnSelectTrain}
            />
        );

        expect(await screen.findByText('T123')).toBeInTheDocument();
        expect(screen.getAllByText('Newcastle').length).toBeGreaterThan(0);
        expect(screen.getAllByText('On Time').length).toBeGreaterThan(0);
        expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('shows error message when train data fails to load', async () => {
        request.get.mockResolvedValueOnce({ data: ['Newcastle'] });
        request.get.mockRejectedValueOnce(new Error('Network error'));

        render(
            <TrainInfo
                visible={true}
                onClose={mockOnClose}
                onSelectTrain={mockOnSelectTrain}
            />
        );

        expect(await screen.findByText('Error: Failed to fetch train data')).toBeInTheDocument();
    });

    it('filters trains when station is selected', async () => {
        request.get.mockResolvedValueOnce({ data: ['Newcastle', 'London'] });
        request.get.mockResolvedValueOnce({
            data: [
                {
                    id: 1,
                    trainId: 'T123',
                    currentStation: 'Newcastle',
                    scheduledArrivalTime: '2026-05-02T10:00:00Z',
                    status: 'ON_TIME',
                    platform: '2',
                },
                {
                    id: 2,
                    trainId: 'T456',
                    currentStation: 'London',
                    scheduledArrivalTime: '2026-05-02T11:00:00Z',
                    status: 'DELAYED',
                    delayMinutes: 10,
                    platform: '4',
                },
            ],
        });

        request.get.mockResolvedValueOnce({
            data: [
                {
                    id: 2,
                    trainId: 'T456',
                    currentStation: 'London',
                    scheduledArrivalTime: '2026-05-02T11:00:00Z',
                    status: 'DELAYED',
                    delayMinutes: 10,
                    platform: '4',
                },
            ],
        });

        render(
            <TrainInfo
                visible={true}
                onClose={mockOnClose}
                onSelectTrain={mockOnSelectTrain}
                onSelectStation={mockOnSelectStation}
            />
        );

        expect(await screen.findByText('T123')).toBeInTheDocument();
        expect(screen.getByText('T456')).toBeInTheDocument();

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: 'London' },
        });

        expect(mockOnSelectStation).toHaveBeenCalledWith('London');

        await waitFor(() => {
            expect(screen.queryByText('T123')).not.toBeInTheDocument();
            expect(screen.getByText('T456')).toBeInTheDocument();
        });
    });

    it('selects a train for coffee order', async () => {
        request.get.mockResolvedValueOnce({ data: ['Newcastle'] });
        request.get.mockResolvedValueOnce({
            data: [
                {
                    id: 1,
                    trainId: 'T123',
                    currentStation: 'Newcastle',
                    scheduledArrivalTime: '2026-05-02T10:00:00Z',
                    status: 'ON_TIME',
                    platform: '2',
                },
            ],
        });

        render(
            <TrainInfo
                visible={true}
                onClose={mockOnClose}
                onSelectTrain={mockOnSelectTrain}
            />
        );

        await screen.findByText('T123');

        fireEvent.click(screen.getByText('Order Coffee'));

        expect(mockSetTrainForOrder).toHaveBeenCalledWith({
            trainId: 'T123',
            currentStation: 'Newcastle',
            arrivalTime: '2026-05-02T10:00:00Z',
            status: 'On Time',
            platform: '2',
        });

        expect(mockOnSelectTrain).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('disables order button for cancelled trains', async () => {
        request.get.mockResolvedValueOnce({ data: ['Newcastle'] });
        request.get.mockResolvedValueOnce({
            data: [
                {
                    id: 1,
                    trainId: 'T999',
                    currentStation: 'Newcastle',
                    scheduledArrivalTime: '2026-05-02T10:00:00Z',
                    status: 'CANCELLED',
                    platform: '1',
                },
            ],
        });

        render(
            <TrainInfo
                visible={true}
                onClose={mockOnClose}
                onSelectTrain={mockOnSelectTrain}
            />
        );

        await screen.findByText('T999');

        const orderButton = screen.getByRole('button', { name: /order coffee/i });

        expect(orderButton).toBeDisabled();
    });
});