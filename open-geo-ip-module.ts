import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HttpModule } from '@angular/http';
import { OpenGeoIp } from './open-geo-ip-service';

@NgModule({
    imports:      [ HttpModule ],
    providers:    [ OpenGeoIp ]
})
export class OpenGeoIpModule {

    constructor (@Optional() @SkipSelf() parentModule: OpenGeoIpModule) {
        if (parentModule) {
            throw new Error(
                'CoreModule is already loaded. Import it in the AppModule only');
        }
    }

}
