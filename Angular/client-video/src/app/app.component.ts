import { Component, ElementRef } from '@angular/core';
import { io } from 'socket.io-client';
import { nanoid } from 'nanoid';
import { ViewChild } from '@angular/core';

declare let Peer: any;
declare const $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('wrapper') wrapper: any;
  title = 'client-video';
  socket: any;
  enteredRoomId: any;
  totalLiveUserConnected: any;
  totalPeers:any= {}

  ngOnInit() {
    this.enteredRoomId = prompt('Enter Your RoomID');
    this.socket = io('http://localhost:3000/');
    // console.log(nanoid())
  }
  ngAfterViewInit() {
    this.socketEventsHandler();
  }
  socketEventsHandler() {
    const peer = new Peer(undefined);
    this.socket.on('connect', () => {
      console.log('client side connection established');
    });

    this.socket.on('user-disconnected', (userId:any) => {
      console.log(userId);
      if (this.totalPeers[userId]) this.totalPeers[userId].close()
    })

    peer.on('open', (id: any) => {
      if (!this.enteredRoomId) {
        this.socket.emit('join-room', nanoid(), id);
      } else {
        this.socket.emit('join-room', this.enteredRoomId, id);
      }
    });

  
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        let video = document.createElement('video');
        this.addStreamHandler(stream, video, true);

        peer.on('call', (call:any) => {
          call.answer(stream)
          // const video = document.createElement('video')
          // call.on('stream', userVideoStream => {
          //   addVideoStream(video, userVideoStream)
          // })
          let video = document.createElement('video');
          call.on('stream', (newUserStream: any) => {
            this.addStreamHandler(newUserStream, video, false);
          });
          call.on('close', () => {
            video.remove();
          });

        })

        this.socket.on('same-room-user', (userId: any) => {
          console.log(userId);
          const call = peer.call(userId, stream);
          let video = document.createElement('video');
          call.on('stream', (newUserStream: any) => {
            this.addStreamHandler(newUserStream, video, false);
          });
          call.on('close', () => {
            video.remove();
          });
          this.totalPeers[userId] = call;
        });
      });
  }

  addStreamHandler(stream: any, video: any, self: boolean) {
    video.classList.add('col-md-4');
    video.muted = self ? true : false;
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    this.wrapper.nativeElement.append(video);
  }
}
