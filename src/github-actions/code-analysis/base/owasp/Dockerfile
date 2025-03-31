FROM owasp/dependency-check-action:latest
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN ls -a /
ENTRYPOINT ["/entrypoint.sh"]