import { Component, OnInit } from '@angular/core';

import * as M from 'materialize-css';

import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-streams',
  templateUrl: './streams.component.html',
  styleUrls: ['./streams.component.css']
})
export class StreamsComponent implements OnInit {

  token: any;
  streamsTab = false;
  topstreamsTab = false;

  constructor(private tokenService: TokenService) { }

  ngOnInit() {
    this.streamsTab = true;
    this.token = this.tokenService.GetPayload();
//    console.log(this.token);

  const tabs = document.querySelector('.tabs');
  M.Tabs.init(tabs, {});
  }

  ChangeTabs(value) {
    if(value === 'streams'){
      this.streamsTab = true;
      this.topstreamsTab = false;
    }

    if(value === 'top'){
      this.streamsTab = false;
      this.topstreamsTab = true;
    }
  }

}
