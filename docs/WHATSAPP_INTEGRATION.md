# WhatsApp Integration Service (Cost-Free)

This service provides a cost-free WhatsApp integration for Livoo CRM using the Baileys library. It allows agencies to connect their own WhatsApp numbers via QR code scanning, similar to WhatsApp Web.

## Features

- **$0 Monthly Cost**: No official WhatsApp Business API or Twilio fees.
- **QR Code Authentication**: Easy connection by scanning a QR code from the CRM.
- **Direct Messaging**: Send messages directly from contact profiles.
- **Message Logging**: All sent messages are logged in the database and contact interactions.
- **Multi-tenant**: Supports multiple agencies with independent sessions.

## Architecture

1. **Frontend**: `WhatsAppConnect` (Configuration) and `SendWhatsAppButton` (Contacts).
2. **Backend**: Next.js API Routes (`/api/whatsapp/*`).
3. **Service**: `BaileysClient` handles the WhatsApp Web protocol.
4. **Storage**: Session data is persisted in the `whatsapp_agency_auth` table in Supabase.

## Database Schema

- `whatsapp_agency_auth`: Stores Baileys credentials, QR codes, and connection status per agency.
- `whatsapp_messages`: Logs all outgoing messages with status tracking.

## Configuration

To connect a new number:
1. Go to **Configuración** -> **Integraciones**.
2. Click on **Connect WhatsApp**.
3. Scan the generated QR code with your phone (WhatsApp -> Linked Devices).

## Security & Anti-Ban

- **Session Persistence**: Sessions typically last 30 days before requiring a re-scan.
- **Anti-Ban Strategy**: The service implements a singleton pattern per agency to avoid multiple concurrent connections. (Note: For high volume, a queue with random delays is recommended).

## Troubleshooting

- **QR not appearing**: Ensure the server has a valid Internet connection and Supabase keys are correct.
- **Disconnected**: Refresh the connection in the configuration page.
- **Blocked number**: If you send too many messages to new contacts, WhatsApp might block the number. Use this service for relationship management rather than bulk spam.
