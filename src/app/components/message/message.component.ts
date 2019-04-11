import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import io from 'socket.io-client';
import { CaretEvent, EmojiEvent } from 'ng2-emoji-picker';
import _ from 'lodash';

import { MessageService } from 'src/app/services/message.service';
import { TokenService } from 'src/app/services/token.service';
import { UsersService } from 'src/app/services/users.service';


@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() users;

  receivername: string;
  user: any;
  message: string;
  receiverData: any;
  messagesArray = [];
  socket: any;
  typingMessage;
  typing = false;
//  usersArray = [];
  isOnline = false;

  public eventMock;
  public eventPosMock;

  public direction = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'top' : 'bottom') : (Math.random() > 0.5 ? 'right' : 'left');
  public toggled = false;
  public content = ' ';

  private _lastCaretEvent: CaretEvent;

  constructor(private tokenService: TokenService,
    private msgService: MessageService,
    private route: ActivatedRoute,
    private userService: UsersService) {
    this.socket = io('http://localhost:3000');
  }

  ngOnInit() {
    this.user = this.tokenService.GetPayload();
    this.route.params.subscribe(params => {
      this.receivername = params.name;
      this.GetUserByUsername(this.receivername);
      this.socket.on('refreshPage', () => {
        this.GetUserByUsername(this.receivername);
      });
    });

  //  this.usersArray = this.users;
  //  console.log(this.usersArray);

    this.socket.on('is_typing', data => {
      if (data.sender === this.receivername) {
        //  console.log(data);
        this.typing = true;
      }
    });

    this.socket.on('has_stopped_typing', data => {
      if (data.sender === this.receivername) {
        this.typing = false;
      }
    });
  }

  /*
  ngOnChanges() {
    console.log(this.users);
  }
  */

  ngOnChanges(changes: SimpleChanges) {
    const title = document.querySelector('.nameCol');
    console.log(changes);
    if (changes.users.currentValue !== null && changes.users.currentValue.length > 0) {
        const result = _.indexOf(changes.users.currentValue, this.receivername);
        if (result > -1) {
          this.isOnline = true;
          (title as HTMLElement).style.marginTop = '10px';
        } else {
          this.isOnline = false;
          (title as HTMLElement).style.marginTop = '20px';
        }
    }
  }

  ngAfterViewInit() {
    const params = {
      room1: this.user.username,
      room2: this.receivername
    };
    this.socket.emit('join chat', params);
  }

  GetUserByUsername(name) {
    this.userService.GetUserByName(name).subscribe(data => {
      //  console.log(data);
      this.receiverData = data.result;

      this.GetMessages(this.user._id, data.result._id);
    });
  }

  GetMessages(senderId, receiverId) {
    this.msgService.GetAllMessages(senderId, receiverId).subscribe(data => {
      //  console.log(data);
      this.messagesArray = data.messages.message;
    });
  }

  SendMessage() {
    if (this.message) {
      this.msgService.SendMessage(this.user._id, this.receiverData._id, this.receiverData.username, this.message).subscribe(data => {
          console.log(data);
        this.socket.emit('refresh', {});
      });
      this.message = '';
    }
  }

  HandleSelection(event: EmojiEvent) {
    this.content = this.content.slice(0, this._lastCaretEvent.caretOffset)
                    + event.char +
                    this.content.slice(this._lastCaretEvent.caretOffset);
    this.eventMock = JSON.stringify(event);

    this.message = this.content;

    this.toggled = !this.toggled;
    this.content = '';
  }

  HandleCurrentCaret(event: CaretEvent) {
    this._lastCaretEvent = event;
    this.eventPosMock = `{ caretOffset : ${event.caretOffset}, caretRange: Range{...}, textContent: ${event.textContent} }`;
  }

  Toggled() {
    this.toggled = !this.toggled;
  }

  IsTyping() {
    this.socket.emit('start_typing', {
      sender: this.user.username,
      receiver: this.receivername
    });

    if (this.typingMessage) {
      clearTimeout(this.typingMessage);
    }

    this.typingMessage = setTimeout(() => {
      this.socket.emit('stop_typing', {
        sender: this.user.username,
        receiver: this.receivername
      });
    }, 500);
  }
}
