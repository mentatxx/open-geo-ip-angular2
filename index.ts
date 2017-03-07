import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenGeoIp } from './src/open-geo-ip-service';
import { HttpModule } from '@angular/http';

export * from './src/open-geo-ip-service';

@NgModule({
  imports: [
    CommonModule, HttpModule
  ],
  declarations: [
  ],
  exports: [
  ]
})
export class OpenGeoIpModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: OpenGeoIpModule,
      providers: [OpenGeoIp]
    };
  }
}
