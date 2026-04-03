// Filters shown on the punt listings page

import Tag from "@/src/components/Tag.jsx";

export default function PuntFilters({ filters, setFilters, users = [] }) {
  return (
    <section className="filter">
      <details className="filter-menu">
        <summary>
          <img src="/filter.svg" alt="filter" />
          <div>
            <p>Punts</p>
            <p>Filter by Punter</p>
          </div>
        </summary>

        <form
          method="GET"
          onSubmit={(event) => {
            event.preventDefault();
            event.target.parentNode.removeAttribute("open");
          }}
        >
          <div>
            <label>
              Punter
              <select
                value={filters.uid}
                onChange={(event) => {
                  const selected = users.find((u) => u.uid === event.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    uid: event.target.value,
                    userName: selected ? selected.displayName : "",
                  }));
                }}
                name="uid"
              >
                <option value="">All</option>
                {users.map((u) => (
                  <option value={u.uid} key={u.uid}>
                    {u.displayName} — {u.position}, {u.team}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <footer>
            <menu>
              <button
                className="button--cancel"
                type="reset"
                onClick={() => {
                  setFilters({
                    uid: "",
                    userName: "",
                  });
                }}
              >
                Reset
              </button>
              <button type="submit" className="button--confirm">
                Submit
              </button>
            </menu>
          </footer>
        </form>
      </details>

      <div className="tags">
        {filters.userName && (
          <Tag
            key="userName"
            type="userName"
            value={`Punter: ${filters.userName}`}
            updateField={(_type, val) => {
              setFilters((prev) => ({ ...prev, uid: val, userName: val }));
            }}
          />
        )}
      </div>
    </section>
  );
}
