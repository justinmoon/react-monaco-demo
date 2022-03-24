import fs from "fs";

class TreeNode {
  constructor(path) {
    this.path = path;
    this.children = [];
  }
}

// https://dev.to/peaonunes/loading-a-directory-as-a-tree-structure-in-node-52bg
export function buildTree(rootPath) {
  const root = new TreeNode(rootPath);
  const paths = [];
  const stack = [root];
  while (stack.length) {
    const currentNode = stack.pop();
    if (currentNode) {
      const children = fs
        .readdirSync(currentNode.path)
        .filter((f) => f !== "node_modules" && f !== ".next" && f !== ".git");
      for (let child of children) {
        const childPath = `${currentNode.path}/${child}`;
        const childNode = new TreeNode(childPath);
        currentNode.children.push(childNode);
        if (fs.statSync(childNode.path).isFile()) {
          paths.push(childPath.substring(2));
        } else if (fs.statSync(childNode.path).isDirectory()) {
          stack.push(childNode);
        }
      }
    }
  }
  return paths;
}

export default function handler(req, res) {
  if (req.method === "GET") {
    const tree = buildTree(".");
    const values = tree.map((path) => {
      const data = fs.readFileSync(path, "utf8");
      // if (err) ;
      return {
        path,
        name: path.split("/").pop(),
        language: "javascript", // TODO
        value: data,
      };
    });

    const reduced = values.reduce(
      (previous, current) => ({ ...previous, [current.path]: current }),
      {}
    );

    res.status(200).json({ content: reduced });
  } else if (req.method === "POST") {
    const { path, content } = req.body;
    fs.writeFile(path, content, (err) => {
      if (err) res.status(500);
      res.status(204);
    });
  } else {
    req.status(405);
  }
}
