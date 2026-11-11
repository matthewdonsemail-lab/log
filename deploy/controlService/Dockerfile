FROM python:3.13-slim

WORKDIR /app
COPY python/controlService/requirements.txt /tmp/controlServiceRequirements.txt
RUN pip install --no-cache-dir -r /tmp/controlServiceRequirements.txt
COPY python ./python

ENV PYTHONPATH=/app/python
EXPOSE 8765
CMD ["uvicorn", "controlService.main:app", "--app-dir", "python", "--host", "0.0.0.0", "--port", "8765"]
