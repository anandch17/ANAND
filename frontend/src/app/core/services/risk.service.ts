import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Observable } from 'rxjs';

export interface DestinationRisk {
    id: number;
    destination: string;
    riskMultiplier: number;
}

@Injectable({
    providedIn: 'root'
})
export class RiskService {
    private readonly http = inject(HttpClient);

    getAll(): Observable<DestinationRisk[]> {
        return this.http.get<DestinationRisk[]>(API_ENDPOINTS.destinationRisk.base);
    }

    create(risk: Partial<DestinationRisk>): Observable<DestinationRisk> {
        return this.http.post<DestinationRisk>(API_ENDPOINTS.destinationRisk.base, risk);
    }

    update(id: number, risk: DestinationRisk): Observable<void> {
        return this.http.put<void>(API_ENDPOINTS.destinationRisk.byId(id), risk);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(API_ENDPOINTS.destinationRisk.byId(id));
    }
}
