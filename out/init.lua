-- Compiled with roblox-ts v1.0.0-beta.15
local TS = _G[script]
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local IS_SERVER = RunService:IsServer()
local REMOTE_FOLDER
local FUNCTION_FOLDER
do
	local REMOTE_FOLDER_NAME = "RemoteEvents"
	local FUNCTION_FOLDER_NAME = "RemoteFunctions"
	if IS_SERVER then
		REMOTE_FOLDER = Instance.new("Folder")
		REMOTE_FOLDER.Name = REMOTE_FOLDER_NAME
		REMOTE_FOLDER.Parent = ReplicatedStorage
		FUNCTION_FOLDER = Instance.new("Folder")
		FUNCTION_FOLDER.Name = FUNCTION_FOLDER_NAME
		FUNCTION_FOLDER.Parent = ReplicatedStorage
	else
		REMOTE_FOLDER = ReplicatedStorage:WaitForChild(REMOTE_FOLDER_NAME)
		FUNCTION_FOLDER = ReplicatedStorage:WaitForChild(FUNCTION_FOLDER_NAME)
	end
end
local _0
do
	_0 = setmetatable({}, {
		__tostring = function()
			return "Anonymous"
		end,
	})
	_0.__index = _0
	function _0.new(...)
		local self = setmetatable({}, _0)
		self:constructor(...)
		return self
	end
	function _0:constructor()
	end
	function _0:GetEvent(name)
		local event = REMOTE_FOLDER:FindFirstChild(name)
		if not event then
			if IS_SERVER then
				event = self:CreateEvent(name)
			else
				event = REMOTE_FOLDER:WaitForChild(name)
			end
		end
		return event
	end
	function _0:CreateEvent(name)
		if not IS_SERVER then
			error("Attempt to create an event on the client")
		end
		local event = Instance.new("RemoteEvent")
		event.Name = name
		event.Parent = REMOTE_FOLDER
		return event
	end
	function _0:GetFunction(name)
		local func = FUNCTION_FOLDER:FindFirstChild(name)
		if not func then
			if IS_SERVER then
				func = self:CreateFunction(name)
			else
				func = FUNCTION_FOLDER:WaitForChild(name)
			end
		end
		return func
	end
	function _0:CreateFunction(name)
		if not IS_SERVER then
			error("Attempt to create a RemoteFunction on the client")
		end
		local func = Instance.new("RemoteFunction")
		func.Name = name
		func.Parent = FUNCTION_FOLDER
		return func
	end
end
local RemoteManager = _0.new()
local _1
do
	_1 = setmetatable({}, {
		__tostring = function()
			return "Anonymous"
		end,
	})
	_1.__index = _1
	function _1.new(...)
		local self = setmetatable({}, _1)
		self:constructor(...)
		return self
	end
	function _1:constructor()
		self.bindables = {}
	end
	function _1:GetBindable(name)
		local _2 = self.bindables
		local _3 = name
		local bindable = _2[_3]
		if not bindable then
			bindable = Instance.new("BindableEvent")
			-- this doesn't need to get parented/named
			local _4 = self.bindables
			local _5 = name
			local _6 = bindable
			-- ▼ Map.set ▼
			_4[_5] = _6
			-- ▲ Map.set ▲
		end
		return bindable
	end
end
local BindableManager = _1.new()
local SimpleShared
do
	SimpleShared = {}
	function SimpleShared:constructor()
	end
end
local SimpleServer
do
	SimpleServer = setmetatable({}, {
		__tostring = function()
			return "SimpleServer"
		end,
	})
	SimpleServer.__index = SimpleServer
	function SimpleServer.new(...)
		local self = setmetatable({}, SimpleServer)
		self:constructor(...)
		return self
	end
	function SimpleServer:constructor()
	end
	SimpleServer.on = TS.async(function(self, name, callback)
		local event = RemoteManager:GetEvent(name)
		return event.OnServerEvent:Connect(callback)
	end)
	SimpleServer.once = TS.async(function(self, name, callback)
		local event = RemoteManager:GetEvent(name)
		local connection
		connection = event.OnServerEvent:Connect(function(...)
			local args = { ... }
			coroutine.wrap(function()
				callback(unpack(args))
			end)()
			connection:Disconnect()
		end)
	end)
	function SimpleServer:fire(name, player, ...)
		local args = { ... }
		local event = RemoteManager:GetEvent(name)
		event:FireClient(player, unpack(args))
	end
	function SimpleServer:fireAllClients(name, ...)
		local args = { ... }
		local event = RemoteManager:GetEvent(name)
		event:FireAllClients(unpack(args))
	end
	SimpleServer.invoke = TS.async(function(self, name, player, ...)
		local args = { ... }
		local func = RemoteManager:GetFunction(name)
		return func:InvokeClient(player, unpack(args))
	end)
	SimpleServer.setCallback = TS.async(function(self, name, callback)
		local func = RemoteManager:GetFunction(name)
		func.OnServerInvoke = callback
	end)
	function SimpleServer:fireBindable(name, ...)
		local args = { ... }
		local bindable = BindableManager:GetBindable(name)
		bindable:Fire(unpack(args))
	end
	function SimpleServer:onBindable(name, callback)
		local bindable = BindableManager:GetBindable(name)
		return bindable.Event:Connect(callback)
	end
	function SimpleServer:onceBindable(name, callback)
		local bindable = BindableManager:GetBindable(name)
		local connection
		connection = bindable.Event:Connect(function(...)
			local args = { ... }
			coroutine.wrap(function()
				callback(unpack(args))
			end)()
			connection:Disconnect()
		end)
	end
	function SimpleServer:register(name)
		RemoteManager:CreateEvent(name)
	end
	function SimpleServer:registerFunction(name)
		RemoteManager:CreateFunction(name)
	end
end
local SimpleClient
do
	SimpleClient = setmetatable({}, {
		__tostring = function()
			return "SimpleClient"
		end,
	})
	SimpleClient.__index = SimpleClient
	function SimpleClient.new(...)
		local self = setmetatable({}, SimpleClient)
		self:constructor(...)
		return self
	end
	function SimpleClient:constructor()
	end
	SimpleClient.on = TS.async(function(self, name, callback)
		local event = RemoteManager:GetEvent(name)
		return event.OnClientEvent:Connect(callback)
	end)
	SimpleClient.once = TS.async(function(self, name, callback)
		local event = RemoteManager:GetEvent(name)
		local connection
		connection = event.OnClientEvent:Connect(function(...)
			local args = { ... }
			coroutine.wrap(function()
				callback(unpack(args))
			end)()
			connection:Disconnect()
		end)
	end)
	function SimpleClient:fire(name, ...)
		local args = { ... }
		local event = RemoteManager:GetEvent(name)
		event:FireServer(unpack(args))
	end
	SimpleClient.invoke = TS.async(function(self, name, ...)
		local args = { ... }
		local func = RemoteManager:GetFunction(name)
		return func:InvokeServer(unpack(args))
	end)
	SimpleClient.setCallback = TS.async(function(self, name, callback)
		local func = RemoteManager:GetFunction(name)
		func.OnClientInvoke = callback
	end)
	function SimpleClient:fireBindable(name, ...)
		local args = { ... }
		local bindable = BindableManager:GetBindable(name)
		bindable:Fire(unpack(args))
	end
	function SimpleClient:onBindable(name, callback)
		local bindable = BindableManager:GetBindable(name)
		return bindable.Event:Connect(callback)
	end
	function SimpleClient:onceBindable(name, callback)
		local bindable = BindableManager:GetBindable(name)
		local connection
		connection = bindable.Event:Connect(function(...)
			local args = { ... }
			coroutine.wrap(function()
				callback(unpack(args))
			end)()
			connection:Disconnect()
		end)
	end
end
--[[
	*
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
]]
local SimpleRef
do
	SimpleRef = setmetatable({}, {
		__tostring = function()
			return "SimpleRef"
		end,
	})
	SimpleRef.__index = SimpleRef
	function SimpleRef.new(...)
		local self = setmetatable({}, SimpleRef)
		self:constructor(...)
		return self
	end
	function SimpleRef:constructor()
		self._bindableInstance = Instance.new("BindableEvent")
	end
	function SimpleRef:connect(callback)
		return self._bindableInstance.Event:Connect(callback)
	end
	function SimpleRef:fire(...)
		local args = { ... }
		return self._bindableInstance:Fire(unpack(args))
	end
end
local Server = SimpleServer.new()
local Client = SimpleClient.new()
local BindableRef = SimpleRef
return {
	Server = Server,
	Client = Client,
	BindableRef = BindableRef,
}
