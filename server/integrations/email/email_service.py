"""
Email Service
Handles all outbound emails for SumitUp — meeting invitations and response notifications.
Uses Gmail SMTP with professional, responsive HTML templates. No emojis.
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict
from config.settings import settings

logger = logging.getLogger(__name__)

class EmailService:
    """
    Manages SMTP connection and email template rendering.
    All templates are inline-styled for maximum email client compatibility.
    """

    def __init__(self):
        self.smtp_server  = settings.smtp_server
        self.smtp_port    = settings.smtp_port
        self.email        = settings.smtp_email
        self.password     = settings.smtp_password
        self.frontend_url = settings.client_url

        if not self.email or not self.password:
            logger.error("Email Credentials not configured!")

    # ──────────────────────────────────────────────────────────────────────────
    # Internal helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _create_smtp_connection(self):
        """Open an authenticated SMTP connection."""
        if not self.email or not self.password:
            raise Exception("SMTP credentials are not configured.")

        server = smtplib.SMTP(self.smtp_server, self.smtp_port)
        server.starttls()
        server.login(self.email, self.password)
        return server

    def _platform_label(self, platform: str) -> str:
        """Convert internal platform codes to human-readable names."""
        labels = {
            "GMEET":   "Google Meet",
            "ZOOM":    "Zoom",
            "MSTEAMS": "Microsoft Teams",
        }
        return labels.get(platform, platform)

    # ──────────────────────────────────────────────────────────────────────────
    # Invitation email template
    # ──────────────────────────────────────────────────────────────────────────

    def _build_invitation_html(self, meeting_data: Dict, invitation_token: str) -> str:
        """
        Build the full HTML body for a meeting invitation email.
        Inline styles are used throughout so the email renders correctly
        in Gmail, Outlook, Apple Mail, and other clients.
        """
        accept_url  = f"{self.frontend_url}/invitation/accept?token={invitation_token}"
        decline_url = f"{self.frontend_url}/invitation/decline?token={invitation_token}"
        platform    = self._platform_label(meeting_data.get("meeting_platform", ""))
        meeting     = meeting_data.get("meeting_name", "Untitled Meeting")
        inviter     = meeting_data.get("inviter_name", "A colleague")
        join_link   = meeting_data.get("meeting_link", "")
        message     = meeting_data.get("custom_message", "")

        # ── Personal message block (only rendered when provided) ──
        message_block = ""
        if message:
            message_block = f"""
            <tr>
              <td style="padding: 0 40px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                       style="background-color:#f0f9ff; border-left:3px solid #0891b2;
                              border-radius:4px;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0 0 6px; font-size:11px; font-weight:700;
                                 letter-spacing:0.08em; text-transform:uppercase;
                                 color:#0369a1;">
                        Personal Message
                      </p>
                      <p style="margin:0; font-size:14px; color:#1e3a5f;
                                 font-style:italic; line-height:1.6;">
                        &ldquo;{message}&rdquo;
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            """

        # ── Join link row (only rendered when a link exists) ──
        join_link_row = ""
        if join_link:
            join_link_row = f"""
            <tr>
              <td style="padding:12px 0 0; border-top:1px solid #e5e7eb;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="width:110px; font-size:13px; font-weight:600;
                                color:#6b7280; padding-top:2px;">
                      Join Link
                    </td>
                    <td style="font-size:13px;">
                      <a href="{join_link}"
                         style="color:#0891b2; font-weight:600;
                                word-break:break-all; text-decoration:none;">
                        {join_link}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            """

        # ── Join meeting button (only rendered when a link exists) ──
        join_button = ""
        if join_link:
            join_button = f"""
            <tr>
              <td style="padding:0 40px 16px; text-align:center;">
                <a href="{join_link}"
                   style="display:inline-block; padding:13px 32px;
                          background-color:#0e7490; color:#ffffff;
                          font-size:14px; font-weight:700; text-decoration:none;
                          border-radius:6px; letter-spacing:0.02em;">
                  Join Meeting
                </a>
              </td>
            </tr>
            """

        return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Meeting Invitation — SumitUp</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9;
             font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f1f5f9; padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Email card — max 600px -->
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px; width:100%; background-color:#ffffff;
                      border-radius:10px; overflow:hidden;
                      box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- ── Header bar ── -->
          <tr>
            <td style="background-color:#0c4a6e; padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0; font-size:20px; font-weight:800;
                               color:#ffffff; letter-spacing:-0.3px;">
                      SumitUp
                    </p>
                    <p style="margin:4px 0 0; font-size:12px; color:#7dd3fc;
                               letter-spacing:0.05em; text-transform:uppercase;
                               font-weight:500;">
                      AI-Powered Meeting Intelligence
                    </p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block; padding:5px 14px;
                                  background-color:#0891b2; color:#ffffff;
                                  font-size:11px; font-weight:700;
                                  border-radius:20px; letter-spacing:0.06em;
                                  text-transform:uppercase;">
                      Meeting Invitation
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Greeting ── -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <p style="margin:0 0 10px; font-size:22px; font-weight:700;
                         color:#0f172a; line-height:1.3;">
                You have been invited to a meeting
              </p>
              <p style="margin:0; font-size:15px; color:#475569; line-height:1.6;">
                <strong style="color:#0f172a;">{inviter}</strong> has invited you
                to join a meeting on SumitUp. Please review the details below and
                confirm your attendance.
              </p>
            </td>
          </tr>

          <!-- ── Meeting details card ── -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background-color:#f8fafc; border:1px solid #e2e8f0;
                            border-radius:8px;">
                <tr>
                  <td style="padding:20px 24px;">

                    <!-- Meeting name -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="margin-bottom:14px; padding-bottom:14px;
                                  border-bottom:1px solid #e5e7eb;">
                      <tr>
                        <td style="width:110px; font-size:13px; font-weight:600;
                                    color:#6b7280; padding-top:2px;">
                          Meeting
                        </td>
                        <td style="font-size:14px; font-weight:700; color:#0f172a;">
                          {meeting}
                        </td>
                      </tr>
                    </table>

                    <!-- Platform -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="margin-bottom:14px; padding-bottom:14px;
                                  border-bottom:1px solid #e5e7eb;">
                      <tr>
                        <td style="width:110px; font-size:13px; font-weight:600;
                                    color:#6b7280; padding-top:2px;">
                          Platform
                        </td>
                        <td>
                          <span style="display:inline-block; padding:3px 12px;
                                        background-color:#dbeafe; color:#1e40af;
                                        font-size:12px; font-weight:600;
                                        border-radius:20px;">
                            {platform}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Invited by -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="margin-bottom:14px; padding-bottom:14px;
                                  border-bottom:1px solid #e5e7eb;">
                      <tr>
                        <td style="width:110px; font-size:13px; font-weight:600;
                                    color:#6b7280; padding-top:2px;">
                          Invited by
                        </td>
                        <td style="font-size:13px; color:#1e293b; font-weight:500;">
                          {inviter}
                        </td>
                      </tr>
                    </table>

                    <!-- Join link (conditional) -->
                    {join_link_row}

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Personal message (conditional) ── -->
          {message_block}

          <!-- ── Divider ── -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #e5e7eb; font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CTA heading ── -->
          <tr>
            <td style="padding:0 40px 20px; text-align:center;">
              <p style="margin:0; font-size:15px; color:#475569;">
                Please respond to this invitation at your earliest convenience.
              </p>
            </td>
          </tr>

          <!-- ── Join meeting button (conditional) ── -->
          {join_button}

          <!-- ── Accept / Decline buttons ── -->
          <tr>
            <td style="padding:0 40px 36px; text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0"
                     style="display:inline-table;">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="{accept_url}"
                       style="display:inline-block; padding:12px 28px;
                              background-color:#059669; color:#ffffff;
                              font-size:14px; font-weight:700; text-decoration:none;
                              border-radius:6px; letter-spacing:0.02em;">
                      Accept Invitation
                    </a>
                  </td>
                  <td>
                    <a href="{decline_url}"
                       style="display:inline-block; padding:12px 28px;
                              background-color:#ffffff; color:#64748b;
                              font-size:14px; font-weight:600; text-decoration:none;
                              border-radius:6px; letter-spacing:0.02em;
                              border:1px solid #cbd5e1;">
                      Decline
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── What you get section ── -->
          <tr>
            <td style="padding:0 40px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background-color:#f0fdf4; border:1px solid #bbf7d0;
                            border-radius:8px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px; font-size:13px; font-weight:700;
                               color:#166534; text-transform:uppercase;
                               letter-spacing:0.06em;">
                      By accepting this invitation you will have access to
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:50%; vertical-align:top;
                                    padding-right:12px;">
                          <p style="margin:0 0 8px; font-size:13px; color:#15803d;">
                            &mdash;&nbsp; AI-generated meeting summaries
                          </p>
                          <p style="margin:0; font-size:13px; color:#15803d;">
                            &mdash;&nbsp; Action items and key decisions
                          </p>
                        </td>
                        <td style="width:50%; vertical-align:top;">
                          <p style="margin:0 0 8px; font-size:13px; color:#15803d;">
                            &mdash;&nbsp; Full meeting transcripts
                          </p>
                          <p style="margin:0; font-size:13px; color:#15803d;">
                            &mdash;&nbsp; Real-time collaboration insights
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color:#f8fafc; border-top:1px solid #e2e8f0;
                        padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px; font-size:12px; color:#94a3b8;">
                      This invitation will expire in <strong>7 days</strong>.
                      If you did not expect this email, you may safely ignore it.
                    </p>
                    <p style="margin:0; font-size:12px; color:#94a3b8;">
                      &copy; 2025 SumitUp-Labs. All rights reserved.
                    </p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <p style="margin:0; font-size:11px; color:#cbd5e1;
                               font-weight:700; letter-spacing:0.05em;">
                      SUMITUP
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Email card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>"""

    # ──────────────────────────────────────────────────────────────────────────
    # Response notification template (sent to the meeting host)
    # ──────────────────────────────────────────────────────────────────────────

    def _build_response_notification_html(self, response_data: Dict) -> str:
        """
        Build the HTML body for the host notification email.
        Sent when an invitee accepts or declines the invitation.
        """
        user_name    = response_data.get("user_name", "A team member")
        meeting_name = response_data.get("meeting_name", "your meeting")
        response     = response_data.get("response", "responded to")
        is_accepted  = response == "accepted"

        status_color = "#059669" if is_accepted else "#64748b"
        status_bg    = "#f0fdf4" if is_accepted else "#f8fafc"
        status_border= "#bbf7d0" if is_accepted else "#e2e8f0"
        status_label = "Accepted" if is_accepted else "Declined"
        status_text  = (
            f"{user_name} has accepted your invitation and will be joining the meeting."
            if is_accepted else
            f"{user_name} has declined your invitation and will not be attending."
        )

        return f"""<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitation Response — SumitUp</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9;
             font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI',
             Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#f1f5f9; padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px; width:100%; background-color:#ffffff;
                      border-radius:10px; overflow:hidden;
                      box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0c4a6e; padding:28px 40px;">
              <p style="margin:0; font-size:20px; font-weight:800;
                         color:#ffffff; letter-spacing:-0.3px;">
                SumitUp
              </p>
              <p style="margin:4px 0 0; font-size:12px; color:#7dd3fc;
                         letter-spacing:0.05em; text-transform:uppercase;
                         font-weight:500;">
                Invitation Response
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 10px; font-size:20px; font-weight:700;
                         color:#0f172a;">
                Invitation {status_label}
              </p>
              <p style="margin:0; font-size:15px; color:#475569; line-height:1.6;">
                {status_text}
              </p>
            </td>
          </tr>

          <!-- Status card -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background-color:{status_bg}; border:1px solid {status_border};
                            border-radius:8px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:110px; font-size:13px; font-weight:600;
                                    color:#6b7280; padding-top:2px;">
                          Respondent
                        </td>
                        <td style="font-size:14px; font-weight:700;
                                    color:#0f172a;">
                          {user_name}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:12px; font-size:13px;
                                    font-weight:600; color:#6b7280;">
                          Meeting
                        </td>
                        <td style="padding-top:12px; font-size:13px;
                                    color:#1e293b;">
                          {meeting_name}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:12px; font-size:13px;
                                    font-weight:600; color:#6b7280;">
                          Status
                        </td>
                        <td style="padding-top:12px;">
                          <span style="display:inline-block; padding:3px 12px;
                                        background-color:{status_color};
                                        color:#ffffff; font-size:12px;
                                        font-weight:700; border-radius:20px;">
                            {status_label}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 36px; text-align:center;">
              <p style="margin:0 0 20px; font-size:14px; color:#475569;">
                You can view all invitation responses in your SumitUp dashboard.
              </p>
              <a href="{self.frontend_url}/dashboard/teams"
                 style="display:inline-block; padding:12px 28px;
                        background-color:#0e7490; color:#ffffff;
                        font-size:14px; font-weight:700; text-decoration:none;
                        border-radius:6px;">
                View in Dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; border-top:1px solid #e2e8f0;
                        padding:24px 40px;">
              <p style="margin:0; font-size:12px; color:#94a3b8;">
                &copy; 2025 SumitUp-Labs. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>"""

    # ──────────────────────────────────────────────────────────────────────────
    # Public send methods
    # ──────────────────────────────────────────────────────────────────────────

    async def send_meeting_invitation(
        self,
        to_email: str,
        meeting_data: Dict,
        invitation_token: str
    ) -> bool:
        """
        Send a meeting invitation email to a SumitUp user.

        Args:
            to_email:          Recipient's email address
            meeting_data:      Dict with meeting_name, meeting_platform,
                               meeting_link, inviter_name, custom_message
            invitation_token:  Unique token used in the accept/decline URLs

        Returns:
            True if the email was sent, False otherwise
        """
        try:
            if not self.email or not self.password:
                print(f"Email not configured — skipping send to: {to_email}")
                return False

            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Meeting Invitation: {meeting_data.get('meeting_name', 'Untitled')} — SumitUp"
            msg["From"]    = f"SumitUp <{self.email}>"
            msg["To"]      = to_email

            # Plain-text fallback for clients that don't render HTML
            plain = (
                f"You have been invited to a meeting on SumitUp.\n\n"
                f"Meeting : {meeting_data.get('meeting_name', 'Untitled')}\n"
                f"Platform: {self._platform_label(meeting_data.get('meeting_platform', ''))}\n"
                f"Invited by: {meeting_data.get('inviter_name', '')}\n"
            )
            if meeting_data.get("meeting_link"):
                plain += f"Join Link: {meeting_data['meeting_link']}\n"
            if meeting_data.get("custom_message"):
                plain += f"\nMessage: {meeting_data['custom_message']}\n"
            plain += (
                f"\nAccept : {self.frontend_url}/invitation/accept?token={invitation_token}\n"
                f"Decline: {self.frontend_url}/invitation/decline?token={invitation_token}\n\n"
                f"This invitation expires in 7 days.\n"
                f"(c) 2025 SumitUp-Labs. All rights reserved."
            )

            msg.attach(MIMEText(plain, "plain"))
            msg.attach(MIMEText(self._build_invitation_html(meeting_data, invitation_token), "html"))

            with self._create_smtp_connection() as server:
                server.send_message(msg)

            print(f"Invitation sent to: {to_email}")
            return True

        except Exception as e:
            print(f"Failed to send invitation to {to_email}: {str(e)}")
            return False

    async def send_invitation_response_notification(
        self,
        to_email: str,
        response_data: Dict
    ) -> bool:
        """
        Notify the meeting host when an invitee accepts or declines.

        Args:
            to_email:       Host's email address
            response_data:  Dict with user_name, meeting_name, response

        Returns:
            True if the email was sent, False otherwise
        """
        try:
            if not self.email or not self.password:
                print(f"Email not configured — skipping notification to: {to_email}")
                return False

            response_text = response_data.get("response", "responded to")
            status_label  = "Accepted" if response_text == "accepted" else "Declined"

            msg = MIMEMultipart("alternative")
            msg["Subject"] = (
                f"Invitation {status_label}: "
                f"{response_data.get('meeting_name', 'your meeting')} — SumitUp"
            )
            msg["From"] = f"SumitUp <{self.email}>"
            msg["To"]   = to_email

            plain = (
                f"Invitation Response\n\n"
                f"{response_data.get('user_name', 'A team member')} has "
                f"{response_text} your invitation to:\n"
                f"\"{response_data.get('meeting_name', 'your meeting')}\"\n\n"
                f"View responses in your dashboard: "
                f"{self.frontend_url}/dashboard/teams\n\n"
                f"(c) 2026 SumitUp-Labs. All rights reserved."
            )

            msg.attach(MIMEText(plain, "plain"))
            msg.attach(MIMEText(self._build_response_notification_html(response_data), "html"))

            with self._create_smtp_connection() as server:
                server.send_message(msg)

            logger.info(f"Response notification sent to: {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send response notification to {to_email}: {str(e)}")
            return False