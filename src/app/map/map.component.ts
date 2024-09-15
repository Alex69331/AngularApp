import { Component } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent {
  private map: L.Map | undefined;
  private customIcon: L.Icon;

  public ipInfo: any = {
    ip: '',
    location: '',
    timezone: '',
    isp: '',
  };

  constructor(private http: HttpClient) {
    this.customIcon = L.icon({
      iconUrl: 'assets/images/icon-location.svg',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    });
  }

  ngOnInit(): void {
    this.initMap();
    this.getPublicIP();
  }

  private initMap(): void {
    this.map = L.map('map', { zoomControl: false }).setView(
      [51.505, -0.09],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(
      this.map
    );
  }

  private getPublicIP(): void {
    this.http
      .get('https://api.ipify.org?format=json')
      .subscribe((data: any) => {
        const publicIp = data.ip;
        this.searchIP(publicIp);
      });
  }

  public searchIP(ip: string): void {
    const apiKey = '8f9056b598ae46daad12021a4debebee';
    const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`;

    this.http.get(url).subscribe((data: any) => {
      this.ipInfo.ip = data.ip;
      this.ipInfo.location = `${data.city}, ${data.state_prov} ${data.zipcode}`;
      this.ipInfo.timezone = `UTC ${data.time_zone.offset}`;
      this.ipInfo.isp = data.isp;

      if (this.map) {
        this.map.setView([data.latitude, data.longitude], 13);

        L.marker([data.latitude, data.longitude], { icon: this.customIcon })
          .addTo(this.map)
          .bindPopup(
            `IP: ${this.ipInfo.ip}<br>Location: ${this.ipInfo.location}`
          )
          .openPopup();
      }
    });
  }
}
