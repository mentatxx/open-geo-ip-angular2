import { Injectable } from '@angular/core';
import { URLSearchParams, Headers, Http } from '@angular/http';
import { Observable, Subject } from 'rxjs';

export const OPEN_GEO_IP_GET_URL = 'https://www.open-geo-ip.com/api/v1.0/ip_addresses/self';
export const OPEN_GEO_IP_POST_URL = 'https://www.open-geo-ip.com/home/register_ip.json';

export interface GeoIpLocation {
    ip: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    state?: string;
}

interface GeoLocationPost {
    latitude: number;
    longitude: number;
    accuracy: string;
}

@Injectable()
export class OpenGeoIp {
    constructor(private http: Http) {
    }

    public getLocation(askForLocation: boolean = true,
                       permissionWaitingTimeout: number = 10000): Observable<GeoIpLocation> {
        if (askForLocation && navigator.geolocation) {
            return this.askUserForLocation(permissionWaitingTimeout);
        } else {
            return this.getLocationFromServer();
        }
    }

    private getLocationFromServer(): Observable<GeoIpLocation> {
        let headers = new Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .get(OPEN_GEO_IP_GET_URL, {headers})
            .map((res) => res.json());
    }

    private sendLocationToServer(data: GeoLocationPost) {
        // thats weird - it uses GET query and works with JSONP
        let headers = new Headers({
            'Content-Type': 'application/json'
        });
        let search: URLSearchParams = new URLSearchParams();
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                search.set(key, data[key]);
            }
        }
        search.set('_', String(Number(new Date())));

        return this.http
            .get(OPEN_GEO_IP_POST_URL, {headers, search});
    }

    private askUserForLocation(permissionWaitingTimeout: number): Observable<GeoIpLocation> {
        const subject = new Subject<GeoIpLocation>();

        const getLocationAndServeToTheSubject = () => {
            this.getLocationFromServer()
                .subscribe((data: GeoIpLocation) => subject.next(data));
        };

        const geolocationOptions = {
            enableHighAccuracy: true,
            maximumAge: 0
        };

        let timeoutId = window.setTimeout(getLocationAndServeToTheSubject, permissionWaitingTimeout);

        navigator.geolocation.getCurrentPosition((position) => {
                clearTimeout(timeoutId);
                const data: GeoLocationPost = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: 'browser'
                };
                this.sendLocationToServer(data)
                    .subscribe(getLocationAndServeToTheSubject, getLocationAndServeToTheSubject);
            }, () => {
                clearTimeout(timeoutId);
                getLocationAndServeToTheSubject();
            },
            geolocationOptions
        );

        return subject.asObservable();
    }
}
