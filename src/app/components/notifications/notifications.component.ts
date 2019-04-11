import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../services/token.service';
import { UsersService } from '../../services/users.service';


import io from 'socket.io-client';
import * as moment from 'moment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  user: any;
  notifications = [];
  socket: any;
  constructor(private tokenService: TokenService, private usersService: UsersService) {
    this.socket = io('http://localhost:3000');
   }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.GetUser();
    this.socket.on('refreshPage', () => {
      this.GetUser();
    });
  }

  GetUser() {
    this.usersService.GetUserByName(this.user.username).subscribe(data => {
      this.notifications = data.result.notifications.reverse();
      console.log(data);
    });
  }

  TimeFromNow(time) {
    return moment(time).fromNow();
  }

  MarkNotification(data) {
  //  console.log(data);
    this.usersService.MarkNotification(data._id).subscribe(value => {
      this.socket.emit('refresh', {});
    });
  }

  DeleteNotification(data) {
  //  console.log(data);
  this.usersService.MarkNotification(data._id, true).subscribe(value => {
    this.socket.emit('refresh', {});
  });
  }

}
