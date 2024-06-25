document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('meta[http-equiv="Permissions-Policy"]').forEach((meta) => {
        meta.setAttribute('content', 'interest-cohort=(), attribution-reporting=(), run-ad-auction=(), private-state-token-redemption=(), private-state-token-issuance=(), join-ad-interest-group=(), compute-pressure=(), browsing-topics=()');
    });
});
