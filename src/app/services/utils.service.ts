import { Injectable } from '@angular/core';
import { isDevMode } from '@angular/core';


@Injectable()
export class UtilsService {

        public hostName(): string{
                var hostname = window.location.hostname;
                var protocol = window.location.protocol;
                var port     = window.location.port;
                var url      = '';
                if (sessionStorage.getItem('shortName')){
                        if(port){
                                url = `${protocol}//${hostname}:${port}/${sessionStorage.getItem('shortName')}`
                        }else {
                                url = `${protocol}//${hostname}/${sessionStorage.getItem('shortName')}`
                        }
                } else if (port) {
                        url = protocol + "//" + hostname + ":" + port + "/api";
                }
                else{
                        url = protocol + "//" + hostname + "/api";
		}
                //console.log("From utils: " + url);
                return 'https://test-cephalix.cephalix.eu/api';
        }
        public log(args) {
                var dev = isDevMode();
                //console.log(dev);
                if (dev) {
                        console.log(args);
                }
        }
}

