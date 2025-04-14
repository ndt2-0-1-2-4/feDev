import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socketConnections: Map<string, WebSocket> = new Map();

  private messagesSubject = new Subject<{url: string, message: any}>();
  
  private connectionStatusSubject = new BehaviorSubject<{[url: string]: boolean}>({});

  constructor() {}

  connect(url: string): WebSocket {
    const existingSocket = this.socketConnections.get(url);
    
  
    if (existingSocket && 
        (existingSocket.readyState === WebSocket.OPEN || 
         existingSocket.readyState === WebSocket.CONNECTING)) {
      console.log(`WebSocket to ${url} already exists and is active`);
      return existingSocket;
    }

    const socket = new window.WebSocket(url);

    this.socketConnections.set(url, socket);

    const updateConnectionStatus = (status: boolean) => {
      const currentStatus = this.connectionStatusSubject.value;
      this.connectionStatusSubject.next({
        ...currentStatus,
        [url]: status
      });
    };

    socket.onopen = (event) => {
      console.log(`WebSocket connected to ${url}:`, event);
      updateConnectionStatus(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.messagesSubject.next({ url, message:event.data });
      } catch (error) {
        this.messagesSubject.next({ url, message: event.data });
      }
    };

    socket.onclose = (event) => {
      console.log(`WebSocket disconnected from ${url}:`, event);
      updateConnectionStatus(false);

      this.socketConnections.delete(url);
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for ${url}:`, error);
      updateConnectionStatus(false);
    };

    return socket;
  }

  sendMessage(url: string, message: any) {
    const socket = this.socketConnections.get(url);
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.warn(`Cannot send message. WebSocket to ${url} is not open.`);
    }
  }

  getMessages(): Observable<{url: string, message: any}> {
    return this.messagesSubject.asObservable();
  }

  getConnectionStatus(): Observable<{[url: string]: boolean}> {
    return this.connectionStatusSubject.asObservable();
  }

  disconnect(url: string) {
    const socket = this.socketConnections.get(url);
    
    if (socket) {
      socket.close();
      this.socketConnections.delete(url);
    }
  }

  disconnectAll() {
    this.socketConnections.forEach((socket, url) => {
      socket.close();
    });
    this.socketConnections.clear();
  }
}