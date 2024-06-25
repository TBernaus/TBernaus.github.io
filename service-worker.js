self.addEventListener('fetch', event => {
    event.respondWith(
      (async function() {
        const response = await fetch(event.request);
        const newHeaders = new Headers(response.headers);
        
        newHeaders.set('Permissions-Policy', 'interest-cohort=(), attribution-reporting=(), run-ad-auction=(), private-state-token-redemption=(), private-state-token-issuance=(), join-ad-interest-group=(), compute-pressure=(), browsing-topics=()');
  
        const modifiedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
  
        return modifiedResponse;
      })()
    );
  });
  