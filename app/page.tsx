



export default async function Home() {
  const data = await fetch('http://localhost:8000/api')
  const posts = JSON.parse((await data.json())[0]);
  console.log(posts);
  return (
    <ul>
        <li>
          <h3>{posts.details}</h3>
          </li>
    </ul>
  )
}

