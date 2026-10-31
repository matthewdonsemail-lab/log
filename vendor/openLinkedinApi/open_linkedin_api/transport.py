from curl_cffi.requests import Cookies, Session

IMPERSONATE = "chrome150"
COOKIE_DOMAIN = ".linkedin.com"

__all__ = ["COOKIE_DOMAIN", "Cookies", "IMPERSONATE", "new_session"]


def new_session(proxies=None):
    return Session(impersonate=IMPERSONATE, proxies=dict(proxies or {}) or None)
