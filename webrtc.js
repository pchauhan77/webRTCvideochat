
    var localVideo;
    var remoteVideo;
    var localStream;
    var remoteVideo;
    var peerConnection;
    var peerConnectionConfig = {
        'iceServers': [
          {'urls': 'stun:stun.stunprotocol.org:3478'},
          {'urls': 'stun:stun.l.google.com:19302'},
        ]
      };

    var socket=io()
    function pageReady() {
        localVideo = document.getElementById('localVideo');
        remoteVideo = document.getElementById('remoteVideo');
    
        //serverConnection = new WebSocket('ws://127.0.0.1:8000');
        //serverConnection.onmessage = gotMessageFromServer;
        socket.on('forward',(message)=>{
            gotMessageFromServer(message)
        })
    
        var constraints = {
            video: true,
            audio: true,
        };
    
        if(navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints) .then(getUserMediaSuccess) .catch(getUserMediaError);
        } else {
            alert('Your browser does not support getUserMedia API');
        }
    }

    function getUserMediaSuccess(stream) {
        localStream = stream;
        localVideo.srcObject = stream;
    }
    
    function getUserMediaError(error) {
        console.log(error);
    }
    
    function createAnswerError(error) {
        console.log(error);
    }

    function start(isCaller) {
        peerConnection = new RTCPeerConnection(peerConnectionConfig);
        peerConnection.onicecandidate = gotIceCandidate;
        peerConnection.onaddstream = gotRemoteStream;
        if(localStream)
        peerConnection.addStream(localStream);
    
        if(isCaller) {
            peerConnection.createOffer().then(gotDescription).catch (createOfferError);
        }
    
    }
    
    function gotDescription(description) {
        console.log('got description');
        peerConnection.setLocalDescription(description, function () {
            //serverConnection.send(JSON.stringify({'sdp': description}));
            socket.emit('message',{'sdp': description})
        }, function() {console.log('set description error')});
    }
    
    function gotIceCandidate(event) {
        if(event.candidate != null) {
            //serverConnection.send(JSON.stringify({'ice': event.candidate}));
            socket.emit('message',{'ice': event.candidate})
        }
    }
    
    function gotRemoteStream(event) {
        console.log('got remote stream');
        const mediastream=event.stream;
        remoteVideo.srcObject = mediastream;
    }
    
    function createOfferError(error) {
        console.log(error);
    }

    function gotMessageFromServer(message) {
        console.log('message!!')
        if(!peerConnection) start(false);

        var signal=message
        if(signal.sdp) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then( function() {
                if(signal.sdp.type == 'offer') {
                    peerConnection.createAnswer().then(gotDescription).catch( createAnswerError);
                }
            });
        } else if(signal.ice) {
            console.log('ice candidate')
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
        }
    }

    function errorHandler(error){
        console.log(error)
    }
