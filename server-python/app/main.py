import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables
load_dotenv()

# Initialize OpenTelemetry (if enabled)
OTEL_ENABLED = os.getenv("OTEL_ENABLED", "false").lower() == "true"

if OTEL_ENABLED:
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    from opentelemetry.sdk.resources import Resource
    from opentelemetry.instrumentation.flask import FlaskInstrumentor
    from opentelemetry.instrumentation.requests import RequestsInstrumentor
    from opentelemetry.instrumentation.langchain import LangchainInstrumentor

    # Create resource with service information
    resource = Resource.create({
        "service.name": os.getenv("OTEL_SERVICE_NAME", "hello-bedrock-app-python"),
        "service.version": "1.0.0",
        "deployment.environment": os.getenv("DEPLOYMENT_ENV", "development"),
    })

    # Set up tracer provider
    tracer_provider = TracerProvider(resource=resource)

    # Configure OTLP exporter
    otlp_exporter = OTLPSpanExporter(
        endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317"),
        insecure=True
    )

    # Add span processor
    tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))

    # Set global tracer provider
    trace.set_tracer_provider(tracer_provider)

    # Instrument libraries
    RequestsInstrumentor().instrument()
    LangchainInstrumentor().instrument()

    print("✅ OpenTelemetry initialized")
    print(f"📡 Service: {os.getenv('OTEL_SERVICE_NAME', 'hello-bedrock-app-python')}")
    print(f"📡 Endpoint: {os.getenv('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4317')}")
    print("✅ LangChain instrumentation enabled")

# Create Flask app
app = Flask(__name__)

# Instrument Flask app (if OpenTelemetry is enabled)
if OTEL_ENABLED:
    FlaskInstrumentor().instrument_app(app)
    print("✅ Flask instrumentation applied")

# Enable CORS
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": "*"
    }
})

# Root endpoint
@app.route("/")
def root():
    return jsonify({
        "message": "AWS Bedrock TODO API",
        "version": "1.0.0",
        "endpoints": {
            "todos": "/api/todos",
            "ai": "/api/ai",
            "search": "/api/search"
        }
    })

# Health check
@app.route("/health")
def health_check():
    return jsonify({"status": "healthy"})

# Error handling
@app.errorhandler(Exception)
def handle_exception(error):
    return jsonify({
        "error": "Internal Server Error",
        "message": str(error)
    }), 500

# Import and register blueprints
from app.routes import todos, ai, search

app.register_blueprint(todos.bp, url_prefix="/api/todos")
app.register_blueprint(ai.bp, url_prefix="/api/ai")
app.register_blueprint(search.bp, url_prefix="/api/search")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )
