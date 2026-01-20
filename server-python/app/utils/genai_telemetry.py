"""
GenAI Observability wrapper for AWS Bedrock LLM calls.
Based on Splunk's OpenTelemetry GenAI utilities.
"""
import os
from contextlib import contextmanager
from typing import Optional, Dict, Any
from opentelemetry.util.genai.types import (
    LLMInvocation,
    InputMessage,
    OutputMessage,
    Text,
)
from opentelemetry.util.genai.handler import get_telemetry_handler


class BedrockTelemetryWrapper:
    """Wrapper for tracking AWS Bedrock LLM calls with GenAI telemetry."""

    def __init__(self):
        self.enabled = os.getenv("OTEL_ENABLED", "false").lower() == "true"
        self.handler = None
        if self.enabled:
            try:
                self.handler = get_telemetry_handler()
            except Exception as e:
                print(f"Warning: Failed to initialize GenAI telemetry handler: {e}")
                self.enabled = False

    @contextmanager
    def track_llm_call(
        self,
        prompt: str,
        model_id: str,
        operation: str = "invoke",
        system_instructions: Optional[str] = None
    ):
        """
        Context manager for tracking a Bedrock LLM invocation.

        Args:
            prompt: User prompt/query sent to the model
            model_id: Bedrock model ID (e.g., us.anthropic.claude-sonnet-4-5-20250929-v1:0)
            operation: Operation type (default: "invoke")
            system_instructions: Optional system instructions/context

        Yields:
            llm_call: LLMInvocation object that should be updated with response data

        Example:
            with wrapper.track_llm_call(prompt, model_id) as llm_call:
                response = bedrock_client.invoke_model(...)
                llm_call.output_messages = [...]
                llm_call.input_tokens = response_headers['X-Amzn-Bedrock-Input-Token-Count']
        """
        if not self.enabled or self.handler is None:
            # If telemetry disabled, yield a dummy object
            yield _DummyLLMInvocation()
            return

        # Create input messages
        input_messages = []
        if system_instructions:
            input_messages.append(
                InputMessage(role="system", parts=[Text(content=system_instructions)])
            )
        input_messages.append(
            InputMessage(role="user", parts=[Text(content=prompt)])
        )

        # Create LLM invocation
        llm_call = LLMInvocation(
            request_model=model_id,
            operation=operation,
            input_messages=input_messages,
        )
        llm_call.provider = "aws-bedrock"
        llm_call.framework = "boto3"

        # Start tracking
        self.handler.start_llm(llm_call)

        try:
            yield llm_call
        except Exception as e:
            # Track error in LLM call
            llm_call.error = str(e)
            raise
        finally:
            # Stop tracking
            self.handler.stop_llm(llm_call)

    def extract_bedrock_tokens(self, response: Dict[str, Any]) -> tuple[int, int]:
        """
        Extract token counts from Bedrock response.

        Args:
            response: Bedrock response dict from invoke_model()

        Returns:
            tuple: (input_tokens, output_tokens)
        """
        response_metadata = response.get('ResponseMetadata', {})
        headers = response_metadata.get('HTTPHeaders', {})

        input_tokens = int(headers.get('x-amzn-bedrock-input-token-count', 0))
        output_tokens = int(headers.get('x-amzn-bedrock-output-token-count', 0))

        return input_tokens, output_tokens

    def create_output_message(
        self,
        content: str,
        finish_reason: str = "stop"
    ) -> OutputMessage:
        """
        Create an OutputMessage for Bedrock response.

        Args:
            content: Response text from the model
            finish_reason: Completion reason (default: "stop")

        Returns:
            OutputMessage object
        """
        return OutputMessage(
            role="assistant",
            parts=[Text(content=content)],
            finish_reason=finish_reason
        )


class _DummyLLMInvocation:
    """Dummy LLM invocation for when telemetry is disabled."""

    def __setattr__(self, name, value):
        pass  # Ignore all attribute assignments


# Global singleton instance
_telemetry_wrapper = None


def get_bedrock_telemetry_wrapper() -> BedrockTelemetryWrapper:
    """Get the global Bedrock telemetry wrapper instance."""
    global _telemetry_wrapper
    if _telemetry_wrapper is None:
        _telemetry_wrapper = BedrockTelemetryWrapper()
    return _telemetry_wrapper
