export default function TodoView({ todos }) {
  return (
    <div className="todo-view">
      <div className="todo-list">
        {todos.map((todo) => (
          <label key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.done}
              readOnly
              className="todo-checkbox"
            />
            <span className={`todo-text ${todo.done ? "todo-done" : ""}`}>
              {todo.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
