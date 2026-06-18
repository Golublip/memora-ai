import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

class P2PSyncHelper {
  ServerSocket? _serverSocket;
  final int _port = 48290; // Dedicated Memora Sync Port

  /// Starts a local TCP server to listen for synchronization requests from trusted local devices.
  Future<void> startLocalSyncServer({
    required Function(String clientIp, String payload) onSyncRequestReceived,
  }) async {
    try {
      _serverSocket = await ServerSocket.bind(InternetAddress.anyIPv4, _port);
      _serverSocket!.listen((Socket clientSocket) {
        clientSocket.listen(
          (Uint8List data) {
            final String payload = utf8.decode(data);
            onSyncRequestReceived(clientSocket.remoteAddress.address, payload);
            
            // Send acknowledgement
            clientSocket.write('ACK_SYNC_SUCCESS');
            clientSocket.close();
          },
          onError: (error) {
            clientSocket.close();
          },
        );
      });
    } catch (_) {
      // Handle server bind exceptions
    }
  }

  /// Connects to a local peer IP address and pushes encrypted memory nodes.
  Future<bool> sendSyncPayloadToPeer({
    required String peerIpAddress,
    required String encryptedPayload,
  }) async {
    try {
      final Socket socket = await Socket.connect(peerIpAddress, _port, timeout: const Duration(seconds: 5));
      socket.write(encryptedPayload);
      
      // Wait for ACK response
      final List<int> responseBytes = await socket.first.timeout(const Duration(seconds: 10));
      final String response = utf8.decode(responseBytes);
      socket.close();
      
      return response == 'ACK_SYNC_SUCCESS';
    } catch (_) {
      return false; // Connection failed or timed out
    }
  }

  /// Closes the active local sync server socket.
  Future<void> stopSyncServer() async {
    if (_serverSocket != null) {
      await _serverSocket!.close();
      _serverSocket = null;
    }
  }
}
