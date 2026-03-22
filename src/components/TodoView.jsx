import { useTripActions } from "../context/TripContext";

export default function TodoView({ todos }) {
  const actions = useTripActions();

  return (
    <div className="todo-view">
      <div className="todo-list">
        {todos.map((todo) => (
          <div key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => actions.toggleTodo(todo.id)}
              className="todo-checkbox"
            />
            <span className={`todo-text ${todo.done ? "todo-done" : ""}`}>
              {todo.text}
            </span>
            <button
              className="remove-btn remove-btn-todo"
              onClick={() => actions.removeTodo(todo.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
