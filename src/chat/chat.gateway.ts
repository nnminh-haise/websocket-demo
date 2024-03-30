import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Logger } from '@nestjs/common';

// * This decorator allows the class to use the socket.io server
@WebSocketGateway({cors: true})
/**
 * * This class is implementing the OnGatewayConnection and OnGatewayDisconnect interfaces
 * * This does not necessary to do so, but since we want to use the `handleConnection` and
 * * `handleDisconnect` hooks, we need to implement them. They will be triggered everytime a
 * * client is connected or dissconnected to the server.
 * 
 * * The `OnGatewayInit` interface is used to implement the `afterInit` method, which is
 * * triggered after the gateway has been initialized.
 */
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    
    // * This is a logger instance to log messages to the console
    private readonly logger = new Logger(ChatGateway.name);
    /**
     * * The `@WebSocketServer()` decorator is used to inject the socket.io server instance
     * * The server instance allows us to trigger events and send data to the clients.
     * 
     * * Together, we use both `server` to keep tracks of the number of users connected to the
     * * server and notify to all the clients.
     */
    @WebSocketServer() server;
    user: number = 0;

    /**
     * * This method is triggered after the gateway has been initialized.
     * @param server a reference to the socket.io server instance
     */
    afterInit(server: any) {
        console.log('Server initialized');
    }

    async handleConnection() {
        this.user++;
        this.server.emit('users', this.user);
        console.log('Connection established! Number of user:', this.user);
    }

    async handleDisconnect() {
        this.user--;
        this.server.emit('users', this.user);
        console.log('Client disconnected! Number of user:', this.user);
    }

    /**
     * * The `@SubscribeMessage` decorator is used to declare a method which is used to listen
     * * to the incoming messages of the clients. Basically, this method is listening to the
     * * clients incoming messages.
     * @param client: a reverence to a socket instance
     * @param payload: the data sent by the client
     */
    @SubscribeMessage('chat')
    async onChat(client, payload: string) {
        /**
         * * Using the `emit` method will trigger a broadcast event to all the connected clients.
         * 
         * * We use this to send the message to all the clients connected to the server.
         * 
         * * We're also using this method to notify all the clients about the connected and
         * * disconnected users.
         */
        this.server.emit('message', payload);
        console.log('Message', payload);
    }
}