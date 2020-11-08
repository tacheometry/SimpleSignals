/// <reference types="compiler-types" />
/// <reference types="@rbxts/types" />
declare abstract class SimpleShared {
    /**
     * Connect to `name`'s corresponding RemoteEvent via `callback`. On the server `OnServerEvent` gets connected. On the client, `OnClientEvent`.
     * @param name The name of the RemoteEvent to connect to.
     * @param callback The callback function.
     * @returns The RBXScriptConnection returned when connecting to this RemoteEvent's RBXScriptSignal.
     */
    abstract on(name: string, callback: Callback): RBXScriptConnection;
    /**
     * Connect to a RemoteEvent **only once** via `callback`. Functions the same as `simple.on`. This implementation doesn't use any Wait methods.
     * @param name The name of the RemoteEvent to connect once to.
     * @param callback The callback function.
     */
    abstract once(name: string, callback: Callback): void;
    /**
    * Fire a RemoteEvent with the specified arguments. On the server `FireServer` gets run. On the client, `FireClient`.
    * @param name The name of the RemoteEvent to fire.
    * @param args The arguments to fire the RemoteEvent with.
    */
    abstract fire(name: string, ...args: unknown[]): void;
    /**
     * Invoke a RemoteFunction with the specified arguments. On the server `InvokeClient` gets run. On the client, `InvokeServer`. Be careful when invoking to a client!
     * @param name The RemoteFunction to invoke.
     * @param args The arguments to pass to the invoke function.
     * @yields
     */
    abstract invoke(name: string, ...args: unknown[]): unknown;
    /**
     * Set the RemoteFunction's `On ... Invoke` callback. On the server, `OnServerInvoke` gets set. On the client, `OnClientInvoke`.
     * @param name The RemoteFunction to set the callback for.
     * @param callback The callback function.
     */
    abstract setCallback(name: string, callback: Callback): void;
    /**
     * Fire a BindableEvent with the specified arguments.
     * @param name The BindableEvent to fire.
     * @param args The arguments to pass to the fire function.
     */
    abstract fireBindable(name: string, ...args: unknown[]): void;
    /**
     * Connect to `name`'s corresponding BindableEvent via `callback`.
     * @param name The name of the BindableEvent to connect to.
     * @param callback The callback function.
     */
    abstract onBindable(name: string, callback: Callback): RBXScriptConnection;
    /**
     * Connect to a BindableEvent **only once** via `callback`. Functions the same as `simple.onBindable`. This implementation doesn't use any Wait methods.
     * @param name The name of the BindableEvent to connect to.
     * @param callback The callback function.
    */
    abstract onceBindable(name: string, callback: Callback): void;
}
/**
 * @hideconstructor
 */
declare class SimpleServer implements SimpleShared {
    on(name: string, callback: (player: Player, ...args: any[]) => any): RBXScriptConnection;
    once(name: string, callback: Callback): void;
    fire(name: string, player: Player, ...args: unknown[]): void;
    fireAllClients(name: string, ...args: unknown[]): void;
    invoke(name: string, player: Player, ...args: unknown[]): unknown;
    setCallback(name: string, callback: Callback): void;
    fireBindable(name: string, ...args: unknown[]): void;
    onBindable(name: string, callback: Callback): RBXScriptConnection;
    onceBindable(name: string, callback: Callback): void;
}
declare class SimpleClient implements SimpleShared {
    on(name: string, callback: Callback): RBXScriptConnection;
    once(name: string, callback: Callback): void;
    fire(name: string, ...args: unknown[]): void;
    invoke(name: string, ...args: unknown[]): unknown;
    setCallback(name: string, callback: Callback): void;
    fireBindable(name: string, ...args: unknown[]): void;
    onBindable(name: string, callback: Callback): RBXScriptConnection;
    onceBindable(name: string, callback: Callback): void;
}
export declare const Server: SimpleServer;
export declare const Client: SimpleClient;
export {};
