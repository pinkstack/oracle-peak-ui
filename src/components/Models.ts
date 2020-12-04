export type RSSI = string;
export type MacAddress = string;
export type Location = string;

interface Device {
    mac: MacAddress;
    rssi: RSSI;
    frequency: number;
    hostname: string;
    vendor: string;
    channel: number;
}

export interface Client extends Device {
    alias: string;
    last_seen: string;
    first_seen: string;
}

export interface AccessPoint extends Device {
    clients: Client[];
    authentication: string;
}

export interface LocationMeasurement extends AccessPoint {
    agent_version: string;
    location: Location;
    client_id: string;
    collected_at: string;
}

export interface Event {
    agent_version: string;
    client_id: string;
    collected_at: string;
    data: Map<string, string | number>;
    key: string;
    location: string;
    tag: string;
    time: string;
}