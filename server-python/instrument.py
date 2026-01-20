from opentelemetry.util.genai.types import (
    Workflow,
    AgentInvocation,
    LLMInvocation,
    InputMessage,
    OutputMessage,
    Text,
)
from opentelemetry.util.genai.handler import get_telemetry_handler
from openai import OpenAI

handler = get_telemetry_handler()
workflow = Workflow(name="agent_demo", workflow_type="planner", initial_input="Plan a 2-day trip to Rome")
handler.start_workflow(workflow)

agent = AgentInvocation(
    name="trip_planner",
    agent_type="planner",
    model="gpt-4o-mini",
    system_instructions="You plan concise city itineraries",
    input_context=workflow.initial_input,
)
handler.start_agent(agent)

llm_call = LLMInvocation(
    request_model="gpt-4o-mini",
    operation="chat",
    input_messages=[
        InputMessage(role="system", parts=[Text(content="You provide day-by-day plans.")]),
        InputMessage(role="user", parts=[Text(content="Plan a 2-day trip to Rome focusing on food and history.")]),
    ],
)
llm_call.provider = "openai"
llm_call.framework = "native-client"
handler.start_llm(llm_call)

client = OpenAI()
openai_messages = [
    {"role": m.role, "content": "".join(p.content for p in m.parts if hasattr(p, "content"))}
    for m in llm_call.input_messages
]
response = client.chat.completions.create(
    model=llm_call.request_model,
    messages=openai_messages,
    temperature=0.3,
)

choice = response.choices[0]
assistant_text = choice.message.content
llm_call.output_messages = [
    OutputMessage(role="assistant", parts=[Text(content=assistant_text)], finish_reason=choice.finish_reason or "stop")
]
if response.usage:
    llm_call.input_tokens = response.usage.prompt_tokens
    llm_call.output_tokens = response.usage.completion_tokens

agent.output_result = assistant_text
handler.stop_llm(llm_call)
handler.stop_agent(agent)
workflow.final_output = assistant_text
handler.stop_workflow(workflow)
