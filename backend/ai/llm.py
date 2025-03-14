import os
import openai
from typing import List, Dict, Any, Optional
# Update imports for LlamaIndex 0.12
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.llms import ChatMessage
from llama_index.program.openai import OpenAIPydanticProgram
from llama_index.core.prompts import PromptTemplate
from config import settings
from ai.schema import Question, Interview, InterviewEvaluation, QuestionList

# Configure OpenAI API
openai.api_key = settings.OPENAI_API_KEY

# Initialize LLM
def get_llm():
    return OpenAI(model=settings.MODEL_NAME, api_key=settings.OPENAI_API_KEY)

# Initialize model for embeddings
def get_embedding_model():
    return OpenAIEmbedding(model=settings.EMBEDDING_MODEL, api_key=settings.OPENAI_API_KEY)

# Function to get text embedding
async def get_embedding(text: str) -> List[float]:
    embedding_model = get_embedding_model()
    embedding = await embedding_model.aget_text_embedding(text)
    return embedding

# Function to generate questions from a prompt
async def generate_questions(prompt: str) -> List[Dict[str, Any]]:
    # Create a prompt template
    prompt_str = f"""
    You are an AI assistant specializing in creating questions for technical interviews.
    Based on the provided text, create a list of 5 or more interview questions.
    The user's text may include recommendations from previous interviews that should be considered when creating questions.
    For each question, determine:
    1. Question text
    2. Tags (technologies, concepts)
    3. Difficulty level (junior, middle, senior)
    
    Text:
    {prompt}
    """
    
    # Create a program for generating questions
    llm = get_llm()
    prompt_template = PromptTemplate(prompt_str)
    program = OpenAIPydanticProgram.from_defaults(
        output_cls=QuestionList,
        prompt=prompt_template,
        llm=llm,
        verbose=settings.DEBUG,
        tool_choice="auto"
    )
    
    try:
        # Run the program to get structured results
        result = await program.acall()  # Replace arun with acall
        
        # Convert Pydantic objects to dictionaries for compatibility
        return [q.model_dump() for q in result.questions]
    except Exception as e:
        print(f"Error generating questions: {e}")
        return []

# Function to generate an interview from a prompt
async def generate_interview(prompt: str, tag_name: Optional[str] = None, questions: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    # Format information about available questions
    questions_info = ""
    if questions:
        questions_info = "Available questions:\n"
        for q in questions:
            tags_str = ", ".join(q.get("tags", []))
            questions_info += f"ID: {q.get('id', 'unknown')}\nQuestion: {q.get('text', '')}\nTags: {tags_str}\nDifficulty: {q.get('difficulty_level', '')}\n\n"
    
    tag_filter = f"for tag '{tag_name}'" if tag_name else ""
    
    # Create a prompt template
    prompt_str = f"""
    You are an AI assistant specializing in creating scenarios for technical interviews.
    You have been provided with a request to create an interview and a list of available questions.
    Your task is to create an interview scenario by selecting appropriate questions and determining:
    1. Interview title
    2. Description
    3. Approximate duration in minutes
    4. Difficulty level (junior, middle, senior)
    5. List of selected question IDs
    
    Interview creation request: {prompt}
    
    {tag_filter}
    
    {questions_info}
    """
    
    # Create a program for generating the interview
    llm = get_llm()
    prompt_template = PromptTemplate(prompt_str)
    program = OpenAIPydanticProgram.from_defaults(
        output_cls=Interview,
        prompt=prompt_template,
        llm=llm,
        verbose=settings.DEBUG,
        tool_choice="auto"
    )
    
    try:
        # Run the program to get structured results
        result = await program.acall()  # Replace arun with acall
        
        # Convert Pydantic object to dictionary for compatibility
        return result.model_dump()
    except Exception as e:
        print(f"Error creating interview: {e}")
        return {
            "title": "Interview Creation Error",
            "description": "Failed to process request",
            "duration_minutes": 30,
            "difficulty_level": "middle",
            "question_ids": []
        }

# Function to evaluate answers to questions
async def evaluate_answers(questions: List[Dict[str, Any]], answers: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Create a mapping of questions and answers
    qa_pairs = []
    for answer in answers:
        for question in questions:
            if str(question.get("id")) == str(answer.get("question_id")):
                qa_pairs.append({
                    "question": question.get("text"),
                    "answer": answer.get("user_answer"),
                    "difficulty_level": question.get("difficulty_level"),
                    "tags": question.get("tags", []),
                    "question_id": str(question.get("id"))
                })
    
    # Format information about questions and answers
    qa_info = "Questions and answers:\n"
    for qa in qa_pairs:
        tags_str = ", ".join(qa.get("tags", []))
        qa_info += f"Question: {qa.get('question')}\nDifficulty: {qa.get('difficulty_level')}\nTags: {tags_str}\nAnswer: {qa.get('answer')}\n\n"
    
    # Create a prompt template
    prompt_str = f"""
    You are an AI expert in evaluating technical interviews.
    Analyze the candidate's answers to questions and evaluate them.
    For each question, determine:
    1. Correctness of the answer (correct, partially correct, incorrect)
    2. Comment on the answer
    3. Provide a correct and complete answer to the question
    
    Also provide an overall evaluation of the interview:
    1. General feedback on the answers
    2. Achieved level (junior, middle, senior)
    3. Score from 0 to 100
    
    {qa_info}
    """
    
    # Create a program for evaluating answers
    llm = get_llm()
    prompt_template = PromptTemplate(prompt_str)
    program = OpenAIPydanticProgram.from_defaults(
        output_cls=InterviewEvaluation,
        prompt=prompt_template,
        llm=llm,
        verbose=settings.DEBUG,
        tool_choice="auto"
    )
    
    try:
        # Run the program to get structured results
        result = await program.acall()  # Replace arun with acall
        
        # Convert Pydantic object to dictionary for compatibility
        eval_data = result.model_dump()
        
        # Create a mapping of question IDs to answer evaluations
        question_id_to_eval = {}
        for i, qa in enumerate(qa_pairs):
            if i < len(eval_data.get("answer_evaluations", [])):
                question_id_to_eval[qa.get("question_id")] = eval_data["answer_evaluations"][i]
        
        eval_data["question_evaluations"] = question_id_to_eval
        
        return eval_data
    except Exception as e:
        print(f"Error evaluating answers: {e}")
        return {
            "feedback": "Could not evaluate answers due to a technical error.",
            "assessment": "Error processing answers.",
            "achieved_level": "junior",
            "score": 0,
            "answer_evaluations": [],
            "question_evaluations": {}
        } 