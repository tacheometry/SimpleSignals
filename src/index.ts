const RunService = game.GetService("RunService");
const ReplicatedStorage = game.GetService("ReplicatedStorage");

const IS_SERVER = RunService.IsServer();
let REMOTE_FOLDER: Folder;
let FUNCTION_FOLDER: Folder;
{
	const REMOTE_FOLDER_NAME = "RemoteEvents";
	const FUNCTION_FOLDER_NAME = "RemoteFunctions";

	if (IS_SERVER) {
		REMOTE_FOLDER = new Instance("Folder");
		REMOTE_FOLDER.Name = REMOTE_FOLDER_NAME;
		REMOTE_FOLDER.Parent = ReplicatedStorage;

		FUNCTION_FOLDER = new Instance("Folder");
		FUNCTION_FOLDER.Name = FUNCTION_FOLDER_NAME;
		FUNCTION_FOLDER.Parent = ReplicatedStorage;
	} else {
		REMOTE_FOLDER = ReplicatedStorage.WaitForChild(
			REMOTE_FOLDER_NAME
		) as Folder;
		FUNCTION_FOLDER = ReplicatedStorage.WaitForChild(
			FUNCTION_FOLDER_NAME
		) as Folder;
	}
}

const RemoteManager = new (class {
	public GetEvent(name: string): RemoteEvent {
		let event = REMOTE_FOLDER.FindFirstChild(name) as
			| RemoteEvent
			| undefined;

		if (!event) {
			if (IS_SERVER) event = this.CreateEvent(name);
			else event = REMOTE_FOLDER.WaitForChild(name) as RemoteEvent;
		}

		return event;
	}

	public CreateEvent(name: string): RemoteEvent {
		if (!IS_SERVER) error("Attempt to create an event on the client");

		const event = new Instance("RemoteEvent");
		event.Name = name;
		event.Parent = REMOTE_FOLDER;

		return event;
	}

	public GetFunction(name: string): RemoteFunction {
		let func = FUNCTION_FOLDER.FindFirstChild(name) as
			| RemoteFunction
			| undefined;

		if (!func) {
			if (IS_SERVER) func = this.CreateFunction(name);
			else func = FUNCTION_FOLDER.WaitForChild(name) as RemoteFunction;
		}

		return func;
	}

	public CreateFunction(name: string): RemoteFunction {
		if (!IS_SERVER)
			error("Attempt to create a RemoteFunction on the client");

		const func = new Instance("RemoteFunction");
		func.Name = name;
		func.Parent = FUNCTION_FOLDER;

		return func;
	}
})();

const BindableManager = new (class {
	private bindables = new Map<string, BindableEvent>();

	public GetBindable(name: string): BindableEvent {
		let bindable = this.bindables.get(name);

		if (!bindable) {
			bindable = new Instance("BindableEvent");
			//this doesn't need to get parented/named
			this.bindables.set(name, bindable);
		}

		return bindable;
	}
})();

type Callback = (...args: unknown[]) => void;

abstract class SimpleShared {
	/**
	 * Connect to `name`'s corresponding RemoteEvent via `callback`. On the server `OnServerEvent` gets connected. On the client, `OnClientEvent`.
	 * @param name The name of the RemoteEvent to connect to.
	 * @param callback The callback function.
	 * @async
	 * @returns The RBXScriptConnection returned when connecting to this RemoteEvent's RBXScriptSignal.
	 */
	abstract on(name: string, callback: Callback): Promise<RBXScriptConnection>;

	/**
	 * Connect to a RemoteEvent **only once** via `callback`. Functions the same as `simple.on`. This implementation doesn't use any Wait methods.
	 * @param name The name of the RemoteEvent to connect once to.
	 * @param callback The callback function.
	 * @async
	 */
	abstract once(name: string, callback: Callback): Promise<void>;

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
	 * @template T What the invoke returns.
	 * @yields
	 */
	abstract invoke<T>(name: string, ...args: unknown[]): Promise<T>;

	/**
	 * Set the RemoteFunction's `On ... Invoke` callback. On the server, `OnServerInvoke` gets set. On the client, `OnClientInvoke`.
	 * @param name The RemoteFunction to set the callback for.
	 * @param callback The callback function.
	 * @async
	 */
	abstract setCallback(name: string, callback: Callback): Promise<void>;

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

class SimpleServer implements SimpleShared {
	async on(
		name: string,
		callback: (player: Player, ...args: any[]) => any
	): Promise<RBXScriptConnection> {
		const event = RemoteManager.GetEvent(name);

		return event.OnServerEvent.Connect(callback);
	}

	async once(name: string, callback: Callback): Promise<void> {
		const event = RemoteManager.GetEvent(name);

		let connection: RBXScriptConnection;
		connection = event.OnServerEvent.Connect((...args: unknown[]) => {
			coroutine.wrap(() => {
				callback(...args);
			})();

			connection.Disconnect();
		});
	}

	fire(name: string, player: Player, ...args: unknown[]): void {
		const event = RemoteManager.GetEvent(name);

		event.FireClient(player, ...args);
	}

	fireAllClients(name: string, ...args: unknown[]): void {
		const event = RemoteManager.GetEvent(name);

		event.FireAllClients(...args);
	}

	async invoke<T>(
		name: string,
		player: Player,
		...args: unknown[]
	): Promise<T> {
		const func = RemoteManager.GetFunction(name);

		return func.InvokeClient(player, ...args) as T;
	}

	async setCallback(name: string, callback: Callback): Promise<void> {
		const func = RemoteManager.GetFunction(name);

		func.OnServerInvoke = callback;
	}

	fireBindable(name: string, ...args: unknown[]): void {
		const bindable = BindableManager.GetBindable(name);

		bindable.Fire(...args);
	}

	onBindable(name: string, callback: Callback): RBXScriptConnection {
		const bindable = BindableManager.GetBindable(name);

		return bindable.Event.Connect(callback);
	}

	onceBindable(name: string, callback: Callback): void {
		const bindable = BindableManager.GetBindable(name);

		let connection: RBXScriptConnection;

		connection = bindable.Event.Connect((...args: unknown[]) => {
			coroutine.wrap(() => {
				callback(...args);
			})();

			connection.Disconnect();
		});
	}

	/**
	 * Preregister a RemoteEvent instead of having it made automatically when calling functions related to it.
	 * @param name The name of the RemoteEvent to preregister.
	 */
	register(name: string): void {
		RemoteManager.CreateEvent(name);
	}

	/**
	 * Preregister a RemoteFunctions instead of having it made automatically when calling functions related to it.
	 * @param name The name of the RemoteFunction to preregister.
	 */
	registerFunction(name: string): void {
		RemoteManager.CreateFunction(name);
	}
}

class SimpleClient implements SimpleShared {
	async on(name: string, callback: Callback): Promise<RBXScriptConnection> {
		const event = RemoteManager.GetEvent(name);

		return event.OnClientEvent.Connect(callback);
	}

	async once(name: string, callback: Callback): Promise<void> {
		const event = RemoteManager.GetEvent(name);

		let connection: RBXScriptConnection;
		connection = event.OnClientEvent.Connect((...args: unknown[]) => {
			coroutine.wrap(() => {
				callback(...args);
			})();

			connection.Disconnect();
		});
	}

	fire(name: string, ...args: unknown[]): void {
		const event = RemoteManager.GetEvent(name);

		event.FireServer(...args);
	}

	async invoke<T>(name: string, ...args: unknown[]): Promise<T> {
		const func = RemoteManager.GetFunction(name);

		return func.InvokeServer(...args);
	}

	async setCallback(name: string, callback: Callback): Promise<void> {
		const func = RemoteManager.GetFunction(name);

		func.OnClientInvoke = callback;
	}

	fireBindable(name: string, ...args: unknown[]): void {
		const bindable = BindableManager.GetBindable(name);

		bindable.Fire(...args);
	}

	onBindable(name: string, callback: Callback): RBXScriptConnection {
		const bindable = BindableManager.GetBindable(name);

		return bindable.Event.Connect(callback);
	}

	onceBindable(name: string, callback: Callback): void {
		const bindable = BindableManager.GetBindable(name);

		let connection: RBXScriptConnection;

		connection = bindable.Event.Connect((...args: unknown[]) => {
			coroutine.wrap(() => {
				callback(...args);
			})();

			connection.Disconnect();
		});
	}
}

/**
 * Make a type-safe BindableEvent with `connect` and `fire` functions. Most commonly used for compartmentalizing events to modules.
 * @template T What the BindableEvent returns.
 * @example
 * // Module1
 * export const somethingHappened = new BindableRef<[number, string]>()
 * coroutine.wrap(() => {
 * 	wait(5);
 * 	somethingHappened.fire(5, "foo");
 * })()
 *
 * // Module2
 * somethingHappened.connect((thisIsANumber, thisIsAString) => {
 *
 * });
 */
class SimpleRef<T extends Array<unknown>> {
	private _bindableInstance: BindableEvent;

	constructor() {
		this._bindableInstance = new Instance("BindableEvent");
	}

	/**
	 * BindableEvent.Connect
	 * @param callback The callback function.
	 */
	connect(callback: (...args: T) => void): RBXScriptConnection {
		return this._bindableInstance.Event.Connect(callback);
	}

	/**
	 * BindableEvent.Event.Fire
	 * @param args The arguments to pass to the BindableEvent.
	 */
	fire(...args: T): void {
		return this._bindableInstance.Fire(...args);
	}
}

export const Server = new SimpleServer();
export const Client = new SimpleClient();
export const BindableRef = SimpleRef;
