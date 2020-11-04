import { RunService, ReplicatedStorage } from "@rbxts/services";

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
		REMOTE_FOLDER = ReplicatedStorage.WaitForChild(REMOTE_FOLDER_NAME) as Folder;
		FUNCTION_FOLDER = ReplicatedStorage.WaitForChild(FUNCTION_FOLDER_NAME) as Folder;
	}
}

const RemoteManager = new class {
	public GetEvent(name: string): RemoteEvent {
		let event = REMOTE_FOLDER.FindFirstChild(name) as RemoteEvent|undefined;
		
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
		let func = FUNCTION_FOLDER.FindFirstChild(name) as RemoteFunction|undefined;
		
		if (!func) {
			if (IS_SERVER) func = this.CreateFunction(name);
			else func = FUNCTION_FOLDER.WaitForChild(name) as RemoteFunction;
		}

		return func;
	}

	public CreateFunction(name: string): RemoteFunction {
		if (!IS_SERVER) error("Attempt to create a RemoteFunction on the client");

		const func = new Instance("RemoteFunction");
		func.Name = name;
		func.Parent = FUNCTION_FOLDER;

		return func;
	}
}

const BindableManager = new class {
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
}

abstract class SimpleShared {
	/**
	 * Connect to a RemoteEvent via `callback`
	 */
	abstract on(name: string, callback: Callback): RBXScriptConnection;
	
	/**
	 * Connect to a RemoteEvent **only once** via `callback` 
	 */
	 abstract once(name: string, callback: Callback): void;
	
	 /**
	 * Fire a RemoteEvent with the specified `args`
	 */
	abstract fire(name: string, ...args: unknown[]): void;
	
	/**
	 * Invoke a RemoteFunction with the specified `args`
	 * @yields
	 */
	abstract get(name: string, ...args: unknown[]): unknown;
	
	/**
	 * Set the RemoteFunction's OnServerInvoke/OnClientInvoke callback to `callback`
	 */
	abstract setCallback(name: string, callback: Callback): void;

	/**
	 * Fire a BindableEvent with the specified `args`
	 */
	abstract fireBindable(name: string, ...args: unknown[]): void;

	/**
	 * Connect to a BindableEvent via `callback`
	 */
	abstract onBindable(name: string, callback: Callback): RBXScriptConnection;

	/** 
	 * Connect to a BindableEvent **only once** via `callback`
	*/
	abstract onceBindable(name: string, callback: Callback): void;
}

export const SimpleServer = new class implements SimpleShared {
	on(name: string, callback: Callback): RBXScriptConnection {
		const event = RemoteManager.GetEvent(name);

		return event.OnServerEvent.Connect(callback);
	}

	once(name: string, callback: Callback): void {
		const event = RemoteManager.GetEvent(name);

		let connection: RBXScriptConnection;

		connection = event.OnServerEvent.Connect((...args: unknown[]) => {
			Promise.spawn(() => {
				callback(...args);
			});

			connection.Disconnect();
		})
	}

	fire(name: string, player: Player, ...args: unknown[]): void {
		const event = RemoteManager.GetEvent(name);

		event.FireClient(player, ...args);
	}

	fireAllClients(name: string, ...args: unknown[]): void {
		const event = RemoteManager.GetEvent(name);

		event.FireAllClients(...args);
	}

	get(name: string, player: Player, ...args: unknown[]): unknown {
		const func = RemoteManager.GetFunction(name);

		return func.InvokeClient(player, ...args);
	}

	setCallback(name: string, callback: Callback): void {
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
			Promise.spawn(() => {
				callback(...args);
			});

			connection.Disconnect();
		});
	}
}

export const SimpleClient = new class implements SimpleShared {
	on(name: string, callback: Callback): RBXScriptConnection {
		const event = RemoteManager.GetEvent(name);

		return event.OnClientEvent.Connect(callback);
	}

	once(name: string, callback: Callback): void {
		const event = RemoteManager.GetEvent(name);

		let connection: RBXScriptConnection;

		connection = event.OnClientEvent.Connect((...args: unknown[]) => {
			Promise.spawn(() => {
				callback(...args);
			});

			connection.Disconnect();
		});
	}

	fire(name: string, ...args: unknown[]): void {
		const event = RemoteManager.GetEvent(name);

		event.FireServer(...args);
	}

	get(name: string, ...args: unknown[]): unknown {
		const func = RemoteManager.GetFunction(name);

		return func.InvokeServer(...args);
	}

	setCallback(name: string, callback: Callback): void {
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
			Promise.spawn(() => {
				callback(...args);
			});

			connection.Disconnect();
		});
	}
}
