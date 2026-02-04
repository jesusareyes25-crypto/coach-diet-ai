import { Client } from "@/types";

const STORAGE_KEY = 'coach_diet_clients';

export const getClients = (): Client[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse clients", e);
        return [];
    }
};

export const saveClient = (client: Client): void => {
    const clients = getClients();
    const existingIndex = clients.findIndex(c => c.id === client.id);

    if (existingIndex >= 0) {
        clients[existingIndex] = client;
    } else {
        clients.push(client);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
};

export const deleteClient = (id: string): void => {
    const clients = getClients();
    const filtered = clients.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getClientById = (id: string): Client | undefined => {
    const clients = getClients();
    return clients.find(c => c.id === id);
};
