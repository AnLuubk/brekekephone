declare global {
  interface Window {
    Brekeke: Brekeke
  }
}

interface Brekeke {
  pbx: {
    getPal(
      wsUri: string,
      options: {
        tenant: string
        login_user: string
        login_password: string
        _wn: string
        park: string[]
        voicemail: string
        user: string
        status: boolean
        secure_login_password: boolean
        phonetype: string
      },
    ): Pbx
  }
  WebrtcClient: {
    Phone: Sip
  }
}

/* PBX */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
export interface Pbx {
  login(onres: () => void, onerr: (err: Error) => void): void
  close(): void

  debugLevel: number

  onClose?(): void
  onError?(err: Error): void
  notify_serverstatus?(e: PbxEvent['serverStatus']): void
  notify_status?(e: PbxEvent['userStatus']): void
  notify_park?(e: PbxEvent['park']): void
  notify_voicemail?(e: PbxEvent['voicemail']): void

  pal<K extends keyof PbxPal>(
    k: K,
    p: Parameters<PbxPal[K]>[0],
  ): Promise<Parameters<Parameters<PbxPal[K]>[1]>[0]>
}

export interface PbxEvent {
  serverStatus: {
    status: 'inactive'
  }
  userStatus: {
    status: string
    user: string
    talker_id: string
  }
  park: {
    park: string
    status: 'on' | 'off'
  }
  voicemail: {
    new: number
  }
}

export interface PbxPal {
  getProductInfo(
    p: null,
    onres: (i: { 'sip.wss.port': string }) => void,
    onerr: (err: Error) => void,
  ): void

  createAuthHeader(
    p: { username: string },
    onres: (authHeader: string) => void,
    onerr: (err: Error) => void,
  ): void

  getExtensions(
    p: {
      tenant: string
      pattern: '..*'
      type: 'user'
      limit: number
    },
    onres: (extensions: string[]) => void,
    onerr: (err: Error) => void,
  ): void

  getExtensionProperties<T extends string | string[]>(
    p: {
      tenant: string
      extension: T
      property_names: string[]
    },
    onres: (properties: T[]) => void,
    onerr: (err: Error) => void,
  ): void

  setExtensionProperties(
    p: {
      tenant: string
      extension: string
      properties: {
        p1_ptype?: string
        p2_ptype?: string
        p3_ptype?: string
        p4_ptype?: string
        pnumber: string
      }
    },
    onres: () => void,
    onerr: (err: Error) => void,
  ): void

  pnmanage(
    p: {
      command: string
      service_id: string
      application_id: string
      user_agent: string
      username: string
      device_id?: string
      endpoint?: string
      auth_secret?: string
      key?: string
    },
    onres: () => void,
    onerr: (err: Error) => void,
  ): void
}

/* SIP */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
export interface Sip {
  new (options: {
    logLevel: string
    multiSession: boolean
    dtmfSendMode: boolean
    ctiAutoAnswer: boolean
    eventTalk: boolean
    defaultOptions: {
      videoOptions: {
        call: {
          mediaConstraints: MediaStreamConstraints
        }
        answer: {
          mediaConstraints: MediaStreamConstraints
        }
      }
    }
  }): Sip

  addEventListener<K extends keyof SipEventMap>(
    type: K,
    listener: (e: SipEventMap[K]) => void,
  ): void
  removeEventListener<K extends keyof SipEventMap>(
    type: K,
    listener: (e: SipEventMap[K]) => void,
  ): void
  setDefaultCallOptions(options: CallOptions): void

  startWebRTC(options: {
    host: string
    port: string
    tenant: string
    user: string
    auth: string
    userAgent: string
    tls: boolean
    useVideoClient: boolean
  }): void
  stopWebRTC(): void

  getSession(sessionId: string): Session
  makeCall(number: string, options: null, videoEnabled: boolean): void
  answer(sessionId: string, options: null, videoEnabled: boolean): void
  setWithVideo(sessionId: string, withVideo: boolean): void
  setMute(options: { main: boolean }, sessionId: string): void

  sendDTMF(dtmf: string, sessionId: string): void
}

export interface CallOptions {
  pcConfig?: {
    iceServers?: RTCIceServer[]
    bundlePolicy?: RTCBundlePolicy
  }
}

export interface SipEventMap {
  phoneStatusChanged: {
    phoneStatus: 'started' | 'stopping' | 'stopped'
  }
  sessionCreated: Session
  sessionStatusChanged: Session
  videoClientSessionCreated: VideoSession
  videoClientSessionEnded: VideoSession
  rtcErrorOccurred: Error
}
interface Session {
  sessionId: string
  sessionStatus: 'dialing' | 'terminated' | 'connected'
  rtcSession: {
    remote_identity: {
      display_name: string
      uri: {
        user: string
      }
    }
    direction: 'outgoing' | 'incoming'
    terminate(): void
  }
  withVideo: boolean
  remoteWithVideo: boolean
  remoteStreamObject: MediaStream
  localStreamObject: MediaStream
  incomingMessage?: {
    getHeader(h: string): string
  }
  videoClientSessionTable: {
    [id: string]: Session
  }
  // Unused properties
  answering: boolean
  audio: boolean
  video: boolean
  shareStream: boolean
  exInfo: string
  muted: {
    main: boolean
    videoClient: boolean
  }
  remoteUserOptionsTable: null
  analyzer: null
}
interface VideoSession {
  sessionId: string
  videoClientSessionId: string
}

/* UC */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
export interface UcChatClient {
  new (log: UcLogger): UcChatClient
  setEventListeners(listeners: UcListeners): void
  signIn(
    uri: string,
    path: string,
    pbxTenant: string,
    pbxUsername: string,
    pbxPassword: string,
    option: null,
    onres: () => void,
    onerr: (err: Error) => void,
  ): void
  signOut(): void
  getProfile(): {
    user_id: string
    name: string
    profile_image_url: string
  }
  getStatus(): {
    status: '0' | '1' | '2' | '3'
    display: string
  }
}

export interface UcLogger {
  new (lv: string): UcLogger
}

export interface UcListeners {
  forcedSignOut?: (e: UcEventMap['forcedSignOut']) => void
  buddyStatusChanged?: (e: UcEventMap['buddyStatusChanged']) => void
  receivedTyping?: (e: UcEventMap['receivedTyping']) => void
  receivedText?: (e: UcEventMap['receivedText']) => void
  fileReceived?: (e: UcEventMap['fileReceived']) => void
  fileInfoChanged?: (e: UcEventMap['fileInfoChanged']) => void
  fileTerminated?: (e: UcEventMap['fileTerminated']) => void
  invitedToConference?: (e: UcEventMap['invitedToConference']) => void
  conferenceMemberChanged?: (e: UcEventMap['conferenceMemberChanged']) => void
}
export interface UcEventMap {
  forcedSignOut: {
    code: string
  }
  buddyStatusChanged: {
    user_id: string
    name: string
    profile_image_url: string
    status: '0' | '1' | '2' | '3'
    display: string
  }
  receivedTyping: {
    tenant: string
    user_id: string
    request_ltime: string
    request_tstamp: number
  }
  receivedText: {
    sender: {
      user_id: string
    }
    conf_id: string
    received_text_id: string
    text: string
    sent_ltime: string
    sent_tstime: number
  }
  fileReceived: {
    fileInfo: {
      file_id: string
      name: string
      size: number
      status: '0' | '1' | '2' | '3' | '4' | '5' | '6'
      progress: number
      target: {
        user_id: string
      }
    }
    conf_id: string
    text_id: string
    sent_ltime: string
    sent_tstime: number
  }
  fileInfoChanged: UcEventMap['fileReceived']
  fileTerminated: UcEventMap['fileReceived']
  invitedToConference: {
    conference: {
      conf_id: string
      subject: string
      from: {
        user_id: string
      }
      user?: {
        user_id: string
        conf_status: 0 | 2
      }[]
      conf_status: 0 | 2
    }
  }
  conferenceMemberChanged: UcEventMap['invitedToConference']
}
