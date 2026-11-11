from dataclasses import dataclass
from typing import Protocol

import httpx

from controlService.settings import Settings


class Mailer(Protocol):
    def send(self, to: str, subject: str, text: str) -> bool: ...


@dataclass
class ResendMailer:
    settings: Settings

    def send(self, to: str, subject: str, text: str) -> bool:
        if not self.settings.resendApiKey or not self.settings.authEmailFrom:
            return False
        body = {"from": self.settings.authEmailFrom, "to": [to], "subject": subject, "text": text}
        if self.settings.authEmailReplyTo:
            body["reply_to"] = self.settings.authEmailReplyTo
        try:
            answer = httpx.post("https://api.resend.com/emails", json=body, headers={"Authorization": f"Bearer {self.settings.resendApiKey}"}, timeout=15)
        except httpx.HTTPError:
            return False
        return answer.status_code < 300


def sign_in_email(code: str) -> tuple[str, str]:
    return "Your log sign-in code", f"Your log sign-in code is {code}\n\nIt expires in 10 minutes. If you did not ask for it, ignore this email."


def invite_email(teamName: str, link: str) -> tuple[str, str]:
    return f"Join {teamName} on log", f"You were invited to {teamName} on log.\n\nSign in with this email address, then open:\n{link}\n\nThe invite expires in 7 days."
