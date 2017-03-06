import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable, Subject } from "rxjs";

export const OPEN_GEO_IP_GET_URL = 'https://www.open-geo-ip.com/api/v1.0/ip_addresses/self';
export const OPEN_GEO_IP_POST_URL = 'https://www.open-geo-ip.com/api/v1.0/ip_addresses/self';

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
            .map((res) => res.json())
    }

    private sendLocationToServer(data: GeoLocationPost) {
        let headers = new Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .post(OPEN_GEO_IP_POST_URL, JSON.stringify(data), {headers})
            .map((res) => res.json())
    }

    private askUserForLocation(permissionWaitingTimeout: number): Observable<GeoIpLocation> {
        function getLocationAndServeToTheSubject() {
            this.getLocationFromServer()
                .subscribe((data: GeoIpLocation) => subject.next(data));
        }

        const subject = new Subject<GeoIpLocation>();

        const geolocation_options = {
            enableHighAccuracy: true,
            maximumAge: 0
        };

        let timeoutId = window.setTimeout(getLocationAndServeToTheSubject, permissionWaitingTimeout);

        navigator.geolocation.getCurrentPosition(function(position) {
                clearTimeout(timeoutId);
                const data: GeoLocationPost = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: 'browser'
                };
                this.sendLocationToServer(data)
                    .subscribe(getLocationAndServeToTheSubject, getLocationAndServeToTheSubject);
            }, function() {
                clearTimeout(timeoutId);
                getLocationAndServeToTheSubject();
            },
            geolocation_options
        );

        return subject.asObservable();
    }
}
