// Enhanced Universal Knowledge Base - Dual Mode Responses
// Quick responses (2-3 sentences) + Full responses (detailed explanations)

const universalKnowledgeEnhanced = {
  // ==================== ALGORITHMS ====================

  algorithms_sorting: {
    keywords: ['sorting', 'bubble sort', 'quick sort', 'merge sort', 'insertion sort', 'heap sort'],
    quick: {
      response: () => `Popular sorting algorithms: Quick Sort (O(n log n) average), Merge Sort (O(n log n) always), Bubble Sort (O(n²) simple), Insertion Sort (O(n²) adaptive). Choose based on data size and whether you need stability! ⚡`
    },
    full: {
      response: () => `### Sorting Algorithms - Complete Guide 📊

Sorting is fundamental to computer science. Here's a comprehensive comparison:

#### 1. **Bubble Sort** - The Simple One
- **How it works**: Compares adjacent elements, swaps if out of order
- **Time**: O(n²) worst/average, O(n) best case
- **Space**: O(1)
- **Use when**: Learning/teaching, already nearly sorted data
- **Disadvantage**: Very slow for large datasets

\`\`\`python
def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr)-1-i):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
\`\`\`

#### 2. **Insertion Sort** - The Adaptive One
- **How it works**: Builds sorted array one item at a time
- **Time**: O(n²) worst/average, O(n) best case
- **Space**: O(1)
- **Use when**: Small datasets, nearly sorted data, online sorting
- **Advantage**: Very efficient for small n, stable

\`\`\`python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr
\`\`\`

#### 3. **Merge Sort** - The Reliable One
- **How it works**: Divide and conquer, then merge sorted halves
- **Time**: O(n log n) always (guaranteed!)
- **Space**: O(n)
- **Use when**: Need guaranteed performance, external sorting
- **Advantage**: Stable, predictable, parallelizable
- **Disadvantage**: Uses extra space

\`\`\`python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    return result + left[i:] + right[j:]
\`\`\`

#### 4. **Quick Sort** - The Fast One
- **How it works**: Pick pivot, partition, recursively sort
- **Time**: O(n log n) average, O(n²) worst
- **Space**: O(log n) recursive stack
- **Use when**: Average case matters, general purpose
- **Advantage**: Fastest average case, in-place, cache-friendly
- **Disadvantage**: Can be slow on bad pivot selection

\`\`\`python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)
\`\`\`

#### 5. **Heap Sort** - The Consistent One
- **How it works**: Build max-heap, extract elements one by one
- **Time**: O(n log n) always
- **Space**: O(1)
- **Use when**: Need guaranteed O(n log n) with O(1) space
- **Advantage**: Consistent performance, in-place

#### Comparison Table:
| Algorithm | Best | Average | Worst | Space | Stable |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Bubble** | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **Insertion** | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| **Merge** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| **Quick** | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| **Heap** | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |

#### When to Use Which:
- **Small data** (< 50): Insertion Sort
- **Already sorted**: Insertion Sort
- **General purpose**: Quick Sort
- **Guaranteed O(n log n)**: Merge Sort or Heap Sort
- **Limited memory**: Heap Sort or Quick Sort
- **Need stable sort**: Merge Sort or Insertion Sort
- **Teaching**: Bubble Sort

**Pro Tip**: Most languages use Hybrid sorts (Timsort, Introsort) that combine multiple algorithms for optimal performance!`
    }
  },

  algorithms_searching: {
    keywords: ['searching', 'binary search', 'linear search', 'find', 'search algorithm'],
    quick: {
      response: () => `Linear search: O(n), works on unsorted data. Binary search: O(log n), requires sorted data - 100x faster on 1 million elements! Use binary search whenever possible! 🎯`
    },
    full: {
      response: () => `### Searching Algorithms - Complete Guide 🔍

#### 1. **Linear Search** - The Simple One
- **How it works**: Check each element until found
- **Time**: O(n) worst/average case, O(1) best
- **Use when**: Unsorted data, small dataset, searching for multiple items
- **Advantage**: Simple, works on unsorted data
- **Disadvantage**: Slow for large sorted datasets

\`\`\`python
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1  # Not found
\`\`\`

#### 2. **Binary Search** - The Smart One
- **How it works**: Eliminate half of remaining elements each step
- **Time**: O(log n) always (if sorted!)
- **Pre-requisite**: Data must be SORTED
- **Use when**: Sorted data, large datasets, performance critical

\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1  # Not found

# Recursive version
def binary_search_recursive(arr, target, left, right):
    if left > right:
        return -1
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)
\`\`\`

#### 3. **How Binary Search Works**
1. Start with entire sorted array
2. Compare middle element with target
3. If equal: Found! Return index
4. If target > middle: Search right half
5. If target < middle: Search left half
6. Repeat until found or range is empty

**Example**: Searching for 42 in [1, 5, 12, 20, 35, 42, 54, 78]
- Step 1: Check middle (20) → 42 > 20 → Search right
- Step 2: Check middle (54) → 42 < 54 → Search left
- Step 3: Check middle (42) → Found! ✅

#### 4. **Performance Comparison**
Array size: 1,000,000 elements
- Linear Search (worst): 1,000,000 comparisons
- Binary Search (worst): ~20 comparisons
- **Speed improvement: 50,000x faster!** ⚡

#### 5. **Comparison Table**:
| Algorithm | Time | Space | Requirement |
|:---|:---:|:---:|:---|
| **Linear** | O(n) | O(1) | None |
| **Binary** | O(log n) | O(1) | Sorted |
| **Binary (Recursive)** | O(log n) | O(log n) | Sorted, Stack |

#### Key Takeaways:
✅ Use Binary Search whenever data is sorted (100x+ faster)
✅ Linear Search for small or unsorted data
✅ Remember: Binary search requires sorted data!
✅ Most real-world search is Binary under the hood`
    }
  },

  // ==================== DATA STRUCTURES ====================

  dsa_arrays: {
    keywords: ['array', 'arrays', 'list'],
    quick: {
      response: () => `Arrays: Fixed-size contiguous memory. Access O(1), Insert/Delete O(n). Great for random access! Use when you need fast lookups and size is known. 📦`
    },
    full: {
      response: () => `### Arrays - Complete Guide 📦

#### 1. **What is an Array?**
A collection of elements stored in contiguous memory locations, each accessed by index (0-based).

\`\`\`python
# Creating arrays
arr = [1, 2, 3, 4, 5]          # List (Python)
arr = array('i', [1,2,3,4,5])  # Array module
arr = np.array([1,2,3,4,5])    # NumPy
\`\`\`

#### 2. **Time Complexities**
| Operation | Time | Why |
|:---|:---:|:---|
| **Access** | O(1) | Direct index access |
| **Search** | O(n) | Linear scan (or O(log n) binary if sorted) |
| **Insert** | O(n) | May need to shift elements |
| **Delete** | O(n) | May need to shift elements |

#### 3. **Array vs Linked List**
| Property | Array | Linked List |
|:---|:---:|:---:|
| Access | O(1) ⚡ | O(n) |
| Insert/Delete | O(n) | O(1) ⚡ |
| Space | Fixed | Dynamic |
| Cache-friendly | ✅ Yes | ❌ No |

#### 4. **Use Arrays When:**
✅ Need fast random access
✅ Size is known and fixed
✅ Cache performance matters
✅ Memory is limited

#### 5. **Common Array Operations**
\`\`\`python
# Accessing elements
arr[0]              # First element: O(1)
arr[-1]             # Last element: O(1)

# Finding element
42 in arr           # O(n) linear search
arr.index(42)       # O(n) find and return index

# Modifying
arr.append(6)       # Add to end: O(1) amortized
arr.insert(2, 99)   # Insert at pos: O(n)
arr.pop()           # Remove last: O(1)
arr.remove(42)      # Remove value: O(n)

# Slicing
arr[1:3]            # Get subarray: O(k) where k = slice size

# Sorting
arr.sort()          # Sort: O(n log n)

# Iteration
for item in arr:    # O(n)
    print(item)
\`\`\`

#### 6. **2D Arrays**
\`\`\`python
# Matrix - 2D array
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Access element at row 1, col 2
element = matrix[1][2]  # Returns 6
\`\`\`

**Key Point**: Arrays are the foundation of most data structures! Master them!`
    }
  },

  dsa_linked_list: {
    keywords: ['linked list', 'link list', 'node', 'singly linked', 'doubly linked'],
    quick: {
      response: () => `Linked List: Dynamic size, each node has data + pointer to next. Insert/Delete O(1) at known position, Access O(n). Use for frequent insertions/deletions! 🔗`
    },
    full: {
      response: () => `### Linked Lists - Complete Guide 🔗

#### 1. **What is a Linked List?**
A dynamic data structure where each element (node) contains data and pointer(s) to next node(s).

\`\`\`python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
\`\`\`

#### 2. **Types of Linked Lists**

**Singly Linked List**: Each node points to next only
\`\`\`
1 → 2 → 3 → None
\`\`\`

**Doubly Linked List**: Each node points to both prev and next
\`\`\`
None ← 1 ↔ 2 ↔ 3 → None
\`\`\`

**Circular Linked List**: Last node points back to first
\`\`\`
1 → 2 → 3 → 1 (circles)
\`\`\`

#### 3. **Time Complexities**
| Operation | Singly | Doubly | Why |
|:---|:---:|:---:|:---|
| Access | O(n) | O(n) | Must traverse from head |
| Insert Front | O(1) | O(1) | Direct link |
| Insert After | O(n) to find, O(1) to insert | O(n) to find, O(1) to insert | Find position, then link |
| Delete | O(n) to find | O(n) to find, O(1) to delete | Deletion is quick, finding takes time |

#### 4. **Common Operations**

**Insertion at Beginning**
\`\`\`python
def insert_at_beginning(data):
    new_node = Node(data)
    new_node.next = self.head
    self.head = new_node  # O(1)
\`\`\`

**Insertion at End**
\`\`\`python
def insert_at_end(data):
    new_node = Node(data)
    if not self.head:
        self.head = new_node
        return
    current = self.head
    while current.next:
        current = current.next  # O(n) traverse
    current.next = new_node      # O(1) link
\`\`\`

**Deletion**
\`\`\`python
def delete(data):
    if not self.head:
        return
    # If head needs to be deleted
    if self.head.data == data:
        self.head = self.head.next
        return
    current = self.head
    while current.next:
        if current.next.data == data:
            current.next = current.next.next
            return
        current = current.next
\`\`\`

#### 5. **Traversal**
\`\`\`python
def display(self):
    current = self.head
    while current:
        print(current.data, end=" → ")
        current = current.next
    print("None")  # O(n) to traverse all n nodes
\`\`\`

#### 6. **Array vs Linked List**
| Operation | Array | Linked List |
|:---|:---:|:---:|
| Access | O(1) ⚡ | O(n) |
| Insert Front | O(n) | O(1) ⚡ |
| Insert End | O(1) | O(n) or O(1) if tail pointer |
| Delete | O(n) | O(n) to find, O(1) to delete |
| Space | Fixed | Dynamic ⚡ |

#### 7. **Use Linked Lists When:**
✅ Frequent insertions/deletions at known position
✅ Dynamic size needed
✅ Memory fragments (no contiguous block needed)
❌ Avoid if: Need fast random access

**Pro Tip**: For fast insertion/deletion at both ends, use Deque (doubly-ended queue) instead!`
    }
  },

  dsa_stack: {
    keywords: ['stack', 'lifo', 'push', 'pop'],
    quick: {
      response: () => `Stack (LIFO): Last-In-First-Out. Push (add) O(1), Pop (remove) O(1). Used for undo/redo, function calls, expression evaluation. Perfect for recursion! 📚`
    },
    full: {
      response: () => `### Stack - Complete Guide 📚

#### 1. **What is a Stack?**
LIFO (Last-In-First-Out) data structure. Think of a stack of plates - you add/remove from the top only.

\`\`\`python
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)      # Add: O(1)
    
    def pop(self):
        if not self.is_empty():
            return self.items.pop()  # Remove: O(1)
    
    def peek(self):
        return self.items[-1]        # View top: O(1)
    
    def is_empty(self):
        return len(self.items) == 0  # Check: O(1)
\`\`\`

#### 2. **Visual Representation**
\`\`\`
Push sequence: 1, 2, 3

Initial:    []
After 1:    [1]
After 2:    [1, 2]
After 3:    [1, 2, 3] ← Top

Pop sequence:
Pop():      Returns 3, Stack = [1, 2]
Pop():      Returns 2, Stack = [1]
Pop():      Returns 1, Stack = []
\`\`\`

#### 3. **Real-World Applications**

**Browser Back Button**
- Each visited page pushed to stack
- Back button pops previous page

**Undo/Redo**
- Each action pushed to undo stack
- Ctrl+Z pops from undo stack

**Function Call Stack**
- Each function call pushed
- Return pops the function

**Expression Evaluation**
- Convert infix to postfix using stack
- Evaluate postfix expressions

#### 4. **Balanced Parentheses Check**
\`\`\`python
def is_balanced(expr):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    
    for char in expr:
        if char in '({[':
            stack.append(char)
        elif char in ')}]':
            if not stack or stack[-1] != pairs[char]:
                return False
            stack.pop()
    
    return len(stack) == 0
\`\`\`

#### 5. **Time & Space Complexities**
| Operation | Time | Space |
|:---|:---:|:---:|
| Push | O(1) | O(1) per element |
| Pop | O(1) | - |
| Peek | O(1) | - |
| Is Empty | O(1) | - |

#### 6. **When to Use Stack:**
✅ Undo/Redo functionality
✅ Expression evaluation
✅ Backtracking problems
✅ Function call stack (automatic)
✅ Browser history

**Key Insight**: Stacks are perfect for problems that need to "undo" or process in reverse order!`
    }
  },

  dsa_queue: {
    keywords: ['queue', 'fifo', 'enqueue', 'dequeue', 'circular queue'],
    quick: {
      response: () => `Queue (FIFO): First-In-First-Out. Enqueue (add) O(1), Dequeue (remove) O(1). Used for job scheduling, BFS, printer queues. Like standing in line! 📋`
    },
    full: {
      response: () => `### Queue - Complete Guide 📋

#### 1. **What is a Queue?**
FIFO (First-In-First-Out) data structure. Like a queue at a shop - first person served first.

\`\`\`python
class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):
        self.items.append(item)      # Add to back: O(1)
    
    def dequeue(self):
        if not self.is_empty():
            return self.items.pop(0) # Remove from front: O(n) ⚠️
    
    def peek(self):
        return self.items[0]         # View front: O(1)
    
    def is_empty(self):
        return len(self.items) == 0  # Check: O(1)

# Better implementation with deque (O(1) dequeue)
from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
    
    def enqueue(self, item):
        self.items.append(item)      # O(1)
    
    def dequeue(self):
        if self.items:
            return self.items.popleft()  # O(1) - better!
\`\`\`

#### 2. **Types of Queues**

**Simple Queue**: Standard FIFO
\`\`\`
Front: 1 ← 2 ← 3 ← Back (enqueue)
Out ↓
\`\`\`

**Circular Queue**: Last connects to first (memory efficient)
\`\`\`
     Front
        ↓
    4 ← 1
    ↓   ↑
    3 → 2 → Rear
\`\`\`

**Priority Queue**: Elements ordered by priority
\`\`\`
High Priority → 5, 3, 1
Low Priority → 2, 4, 0
\`\`\`

**Double-Ended Queue (Deque)**: Add/Remove from both ends
\`\`\`
← 1 ↔ 2 ↔ 3 →
(Both ends flexible)
\`\`\`

#### 3. **Time Complexities**

**Using List** (Simple):
| Operation | Time | Note |
|:---|:---:|:---|
| Enqueue | O(1) | Append to back |
| Dequeue | O(n) | ⚠️ Remove from front |
| Peek | O(1) | Access front |

**Using Deque** (Better):
| Operation | Time |
|:---|:---:|
| Enqueue | O(1) ⚡ |
| Dequeue | O(1) ⚡ |
| Peek | O(1) |

#### 4. **Real-World Applications**

**CPU Scheduling**
- Processes wait in queue
- CPU dequeues and processes

**Printer Queue**
- Print jobs enqueued
- Printer processes in FIFO order

**BFS (Breadth-First Search)**
\`\`\`python
def bfs(graph, start):
    queue = deque([start])
    visited = {start}
    
    while queue:
        node = queue.popleft()
        print(node)
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
\`\`\`

#### 5. **When to Use Queue:**
✅ Job scheduling
✅ BFS traversal
✅ Printer/resource queues
✅ Message processing
✅ Traffic management

**Key Insight**: Use \`deque\` from collections module for O(1) operations on both ends!

**Pro Tip**: Priority Queue is a special queue ordered by priority, often implemented with a heap!`
    }
  },

  // ==================== DATABASE ====================

  dbms_normalization: {
    keywords: ['normalization', 'normal form', '1nf', '2nf', '3nf', 'bcnf'],
    quick: {
      response: () => `Normalization removes redundancy. 1NF: Atomic values. 2NF: No partial dependencies. 3NF: No transitive dependencies. BCNF: Strict superset. Design better databases! 🗄️`
    },
    full: {
      response: () => `### Database Normalization - Complete Guide 🗄️

#### 1. **Why Normalization?**
Reduces:
- ❌ Redundancy (duplicate data)
- ❌ Anomalies (insert, update, delete problems)
- ❌ Inconsistency

Benefits:
- ✅ Better data integrity
- ✅ Efficient queries
- ✅ Easier maintenance

#### 2. **First Normal Form (1NF)**
**Rule**: All values must be atomic (no repeating groups)

**Bad (Not 1NF)**:
\`\`\`
StudentID | Name  | Courses
1         | Alice | Math, Physics, Chemistry
2         | Bob   | Java, Python
\`\`\`

**Good (1NF)**:
\`\`\`
StudentID | Name  | Course
1         | Alice | Math
1         | Alice | Physics
1         | Alice | Chemistry
2         | Bob   | Java
2         | Bob   | Python
\`\`\`

#### 3. **Second Normal Form (2NF)**
**Rule**: Must be 1NF + No partial dependencies
- All non-key attributes must depend on ENTIRE primary key

**Bad (Not 2NF)** - Partial dependency on StudentID only:
\`\`\`
StudentID | CourseID | StudentName | CourseName
1         | 101      | Alice       | Math
\`\`\`
(StudentName depends on StudentID, not on (StudentID, CourseID))

**Good (2NF)** - Separate tables:
\`\`\`
STUDENTS:              COURSES:          ENROLLMENTS:
StudentID | Name      CourseID | Name    StudentID | CourseID
1         | Alice     101      | Math    1         | 101
                      102      | Physics 1         | 102
\`\`\`

#### 4. **Third Normal Form (3NF)**
**Rule**: Must be 2NF + No transitive dependencies
- Non-key attributes must not depend on other non-key attributes

**Bad (Not 3NF)** - Transitive dependency:
\`\`\`
StudentID | Name  | DepartmentID | DepartmentName | DeptBuilding
1         | Alice | 5            | CSE            | Block A
\`\`\`
(DeptBuilding depends on DepartmentID, not on StudentID)

**Good (3NF)** - Separate tables:
\`\`\`
STUDENTS:           DEPARTMENTS:
StudentID | Name    DepartmentID | Name | Building
1         | Alice   5            | CSE  | Block A

Then StudentID → DepartmentID → Building
(No transitive dependency from StudentID)
\`\`\`

#### 5. **Boyce-Codd Normal Form (BCNF)**
**Rule**: Stricter than 3NF
- Every determinant must be a candidate key

Usually 3NF is sufficient for most applications.

#### 6. **Normalization Example**

Starting table (Unnormalized):
\`\`\`
TeacherID | TeacherName | SubjectID | SubjectName | DepartmentID | DepartmentName
1         | Mr. Smith   | 101       | Math        | 5            | CSE
1         | Mr. Smith   | 102       | Physics     | 5            | CSE
2         | Ms. Johnson | 103       | English     | 3            | ECE
\`\`\`

Normalized Design (3NF):
\`\`\`
TEACHERS:
TeacherID | Name
1         | Mr. Smith
2         | Ms. Johnson

SUBJECTS:
SubjectID | Name    | DepartmentID
101       | Math    | 5
102       | Physics | 5
103       | English | 3

DEPARTMENTS:
DepartmentID | Name
5            | CSE
3            | ECE

TEACHER_SUBJECTS:
TeacherID | SubjectID
1         | 101
1         | 102
2         | 103
\`\`\`

#### 7. **Denormalization**
Sometimes break normalization rules for:
- ✅ Query performance (reduce joins)
- ✅ Caching data
- ✅ Reporting systems

**Example**: Store DepartmentName in TEACHERS table for faster queries (adds redundancy but speeds up reads)

#### 8. **Key Concepts**
- **Functional Dependency (FD)**: A → B means if A is same, B must be same
- **Candidate Key**: Minimal set of attributes that uniquely identifies a record
- **Primary Key**: Chosen candidate key
- **Transitive Dependency**: A → B → C (A indirectly determines C)

**Pro Tip**: Design database in 3NF by default, then denormalize only if performance testing shows need!`
    }
  },

  dbms_joins: {
    keywords: ['join', 'inner join', 'left join', 'right join', 'full join', 'cross join', 'sql join'],
    quick: {
      response: () => `INNER: Matching records only. LEFT: All from left + matches. RIGHT: All from right + matches. FULL: All from both. CROSS: Cartesian product. 🔗`
    },
    full: {
      response: () => `### SQL Joins - Complete Visual Guide 🔗

#### 1. **INNER JOIN**
Returns only matching records from both tables

\`\`\`sql
SELECT s.name, c.course_name
FROM students s
INNER JOIN courses c ON s.course_id = c.id;
\`\`\`

Visual:
\`\`\`
Students        Courses
┌─────┐        ┌──────┐
│  A  │        │  1   │
│  B  │◄───────┤  2   │
│  C  │        │  3   │
└─────┘        └──────┘
    ↓
Result: Only B (matches)
\`\`\`

#### 2. **LEFT JOIN (LEFT OUTER JOIN)**
All from left + matching from right

\`\`\`sql
SELECT s.name, c.course_name
FROM students s
LEFT JOIN courses c ON s.course_id = c.id;
\`\`\`

Visual:
\`\`\`
Students        Courses
┌─────┐        ┌──────┐
│  A  │ ───┐   │  1   │
│  B  │ ───┼───┤  2   │
│  C  │ ───┘   │  3   │
└─────┘        └──────┘
    ↓
Result: A (no match, null), B (match), C (no match, null)
\`\`\`

#### 3. **RIGHT JOIN (RIGHT OUTER JOIN)**
All from right + matching from left

\`\`\`sql
SELECT s.name, c.course_name
FROM students s
RIGHT JOIN courses c ON s.course_id = c.id;
\`\`\`

Visual - All from Courses:
\`\`\`
Result: 1 (no student, null), 2 (student B), 3 (no student, null)
\`\`\`

#### 4. **FULL OUTER JOIN**
All from both tables

\`\`\`sql
SELECT s.name, c.course_name
FROM students s
FULL OUTER JOIN courses c ON s.course_id = c.id;
\`\`\`

Visual:
\`\`\`
Result: A (null), B (match), C (null), 1 (null), 2 (included), 3 (null)
(All rows from both tables)
\`\`\`

#### 5. **CROSS JOIN**
Cartesian product - every row from left with every row from right

\`\`\`sql
SELECT s.name, c.course_name
FROM students s
CROSS JOIN courses c;
\`\`\`

If Students has 3 rows, Courses has 3 rows:
Result = 3 × 3 = 9 rows (all combinations)

#### 6. **Join Conditions**
\`\`\`sql
-- Equality join (most common)
ON table1.id = table2.id

-- Multiple conditions
ON table1.id = table2.id AND table1.dept = table2.dept

-- Non-equality join
ON table1.age > table2.age

-- Self-join (join table with itself)
SELECT a.name, b.name
FROM employees a
INNER JOIN employees b ON a.manager_id = b.id;
\`\`\`

#### 7. **Multiple Joins**
\`\`\`sql
SELECT s.name, c.course_name, p.prof_name
FROM students s
INNER JOIN courses c ON s.course_id = c.id
INNER JOIN professors p ON c.prof_id = p.id;
\`\`\`

#### 8. **Join Performance Tips**
✅ Join on indexed columns
✅ Use INNER JOIN when possible (most efficient)
✅ Limit columns selected
✅ Filter before joining (WHERE clause)
✅ Avoid Cartesian products

#### 9. **Join Type Comparison**
| Join Type | Returns | Use Case |
|:---|:---|:---|
| **INNER** | Matches only | Main data needed |
| **LEFT** | All left + matches | Keep all left records |
| **RIGHT** | Matches + all right | Keep all right records |
| **FULL** | All from both | Complete data set |
| **CROSS** | Cartesian product | Rare, specific uses |

**Key Insight**: Always check your join condition - wrong joins = wrong data!`
    }
  },

  // ==================== NETWORKING ====================

  networks_osi: {
    keywords: ['osi model', 'osi', 'layer', 'network layer', 'physical layer', 'application layer'],
    quick: {
      response: () => `OSI has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. Remember: "Please Do Not Touch Steve's Pet Alligator!" 🌍`
    },
    full: {
      response: () => `### OSI Model - 7 Layers Explained 🌍

#### 1. **Overview**
OSI (Open Systems Interconnection) model describes how data flows through networks.

Mnemonic: **P**lease **D**o **N**ot **T**each **S**teve's **P**et **A**lligator

#### 2. **Layer 1: Physical Layer** 🔌
**What**: Actual hardware, transmission medium
**Devices**: Cables, hubs, repeaters, modems
**Units**: Bits (1 or 0)
**Examples**:
- Ethernet cables
- Wi-Fi radio waves
- Fiber optic cables
- USB connections

**Protocols**: None (hardware)

#### 3. **Layer 2: Data Link Layer** 🔗
**What**: Direct node-to-node communication, MAC addressing
**Devices**: Switches, bridges
**Units**: Frames
**Examples**:
- MAC addresses (00:1A:2B:3C:4D:5E)
- Ethernet
- Wi-Fi (802.11)
- PPP

**Key**: Ensures error-free delivery within local network

#### 4. **Layer 3: Network Layer** 🌐
**What**: Routing, IP addressing, logical addressing
**Devices**: Routers
**Units**: Packets
**Examples**:
- IP (IPv4, IPv6)
- ICMP (Ping)
- Routing protocols (OSPF, BGP)

**Analogy**: Like postal addresses directing mail

#### 5. **Layer 4: Transport Layer** 🚚
**What**: End-to-end communication, flow control, reliability
**Protocols**:
- **TCP** (Transmission Control Protocol)
  - Connection-oriented
  - Reliable
  - In-order delivery
  - Example: HTTP, FTP, Email
  
- **UDP** (User Datagram Protocol)
  - Connectionless
  - Unreliable (may lose packets)
  - Fast
  - Example: Live streaming, Online gaming, DNS

**Units**: Segments (TCP) or Datagrams (UDP)

#### 6. **Layer 5: Session Layer** 🎫
**What**: Manages sessions, authentication
**Functions**:
- Establish, maintain, terminate connections
- Authentication and authorization
- Dialog control

**Example**: Login sessions, RPC (Remote Procedure Call)

#### 7. **Layer 6: Presentation Layer** 🎨
**What**: Data formatting, encryption, compression
**Functions**:
- Encryption/Decryption
- Compression
- Character encoding (ASCII, Unicode)
- Data translation

**Examples**: SSL/TLS, JPEG compression, MPEG video

#### 8. **Layer 7: Application Layer** 💻
**What**: User applications and services
**Protocols**:
- **HTTP/HTTPS** - Web browsing
- **FTP** - File transfer
- **SMTP/POP3** - Email
- **DNS** - Domain naming
- **SSH** - Secure shell
- **Telnet** - Remote login

**Units**: Data/Messages

#### 9. **OSI vs TCP/IP**

OSI has 7 layers, TCP/IP has 4-5:

| OSI Layers | TCP/IP Model |
|:---|:---|
| Application, Presentation, Session | Application |
| Transport | Transport |
| Network | Internet |
| Data Link, Physical | Link/Network Access |

#### 10. **Data Flow Through Layers**

**Sending Data (Top to Bottom)**:
\`\`\`
Application: "Send HTTP request"
     ↓ Add HTTP header
Presentation: "Encrypt data"
     ↓ Add session info
Session: "Manage connection"
     ↓ Add TCP header
Transport: TCP protocol selected
     ↓ Add IP header
Network: Router selection
     ↓ Add MAC header
Data Link: 
     ↓ Convert to bits
Physical: Send over cable
\`\`\`

**Receiving Data (Bottom to Top)**:
\`\`\`
Physical: Receive bits from cable
     ↓ Convert from bits
Data Link: Check MAC
     ↓ Remove MAC header
Network: Check IP address
     ↓ Remove IP header
Transport: TCP/UDP processing
     ↓ Remove TCP/UDP header
Session: Restore session
     ↓ Remove session info
Presentation: Decrypt data
     ↓ Remove encryption
Application: Display to user
\`\`\`

#### 11. **Key Points**
✅ Each layer communicates with adjacent layers
✅ Lower layers add headers (encapsulation)
✅ Receiving side removes headers (decapsulation)
✅ Layers are independent (can replace without affecting others)

**Mnemonic for remembering order** (top to bottom):
**A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing

**Pro Tip**: Understanding OSI helps debug network issues - identify which layer the problem is at!`
    }
  },

  networks_tcp_vs_udp: {
    keywords: ['tcp', 'udp', 'transport protocol', 'tcp vs udp', 'tcp/ip'],
    quick: {
      response: () => `TCP: Connection-oriented, reliable, ordered, slower. UDP: Connectionless, unreliable, fast. Use TCP for files/emails, UDP for streaming/gaming. 📡`
    },
    full: {
      response: () => `### TCP vs UDP - Complete Comparison 📡

#### 1. **TCP (Transmission Control Protocol)**

**Characteristics**:
- ✅ Connection-oriented (3-way handshake)
- ✅ Reliable delivery (no packet loss)
- ✅ Ordered delivery (packets arrive in order)
- ✅ Flow control (sender doesn't overwhelm receiver)
- ✅ Error checking
- ❌ Slower (due to reliability checks)
- ❌ More overhead

**Connection Setup (3-way Handshake)**:
\`\`\`
Client                          Server
  |------ SYN (seq=x) ------→|
  |←----- SYN-ACK (seq=y) ----|
  |------ ACK (seq=x+1) ------→|
  Connection established!
\`\`\`

**When to Use TCP**:
✅ Email (SMTP, POP3)
✅ Web browsing (HTTP/HTTPS)
✅ File transfer (FTP)
✅ Remote login (SSH, Telnet)
✅ Any application where data integrity matters

#### 2. **UDP (User Datagram Protocol)**

**Characteristics**:
- ❌ Connectionless (no handshake)
- ❌ Unreliable (may lose packets)
- ❌ No ordering guarantee
- ✅ Fast (minimal overhead)
- ✅ Lower latency
- ✅ Connectionless (stateless)

**Packet Sending**:
\`\`\`
Client just sends data to Server
No connection established
No confirmation received
Data might be lost - doesn't care!
\`\`\`

**When to Use UDP**:
✅ Live video/audio streaming
✅ Online gaming
✅ VoIP (Skype, etc.)
✅ DNS queries
✅ IoT sensor data
✅ Applications where speed > reliability

#### 3. **Detailed Comparison**

| Feature | TCP | UDP |
|:---|:---:|:---:|
| **Connection** | Establish (3-way) | None |
| **Reliability** | Guaranteed | Best-effort |
| **Ordering** | In-order | No guarantee |
| **Speed** | Slower | Faster ⚡ |
| **Overhead** | High | Low |
| **Error Checking** | Extensive | Basic |
| **Flow Control** | Yes | No |
| **Congestion Control** | Yes | No |
| **Packet Size** | Segments | Datagrams |
| **Broadcasting** | No | Yes |
| **Use Case** | Files, Email | Streaming, Gaming |

#### 4. **TCP Header vs UDP Header**

**TCP Header** (20-60 bytes):
\`\`\`
Source Port | Destination Port | Sequence Number
Ack Number | Flags | Window Size | Checksum | ...
(More fields for reliability)
\`\`\`

**UDP Header** (8 bytes):
\`\`\`
Source Port | Destination Port | Length | Checksum
(Minimal - just essentials)
\`\`\`

#### 5. **Real-World Examples**

**TCP Applications**:
\`\`\`
1. Browser → Web Server (HTTP)
   GET /index.html HTTP/1.1
   (Every packet guaranteed to arrive)

2. Email Client → Mail Server (SMTP)
   SEND email to rajub@gmail.com
   (Can't lose emails!)

3. File Download (FTP)
   Download 100MB file
   (Must receive all bytes intact)
\`\`\`

**UDP Applications**:
\`\`\`
1. Video Streaming (Netflix, YouTube)
   Losing 1 frame = OK, continue streaming
   Speed > perfection

2. Online Gaming (Multiplayer FPS)
   Losing 1 position update = OK
   Real-time response matters

3. VoIP (Skype)
   Losing 1 audio packet = slight cut
   Speed for communication essential

4. DNS Query
   "What's IP of google.com?"
   If no response, retry
   Speed important, 1 packet OK to lose
\`\`\`

#### 6. **Hybrid Approach**

Modern applications often use **QUIC** (combining benefits of both):
- Based on UDP (fast)
- Adds reliability like TCP
- Lower latency
- Used by HTTP/3

#### 7. **Decision Tree**

\`\`\`
Need reliable delivery?
  YES → TCP
  NO → UDP?
       Need ordering?
         YES → TCP
         NO → UDP ✅
Need low latency?
  YES → UDP (if can tolerate loss)
  NO → TCP (if need perfection)
\`\`\`

**Real Interview Question**: "When would you use UDP over TCP?"

**Answer**: When **speed > accuracy**, like gaming or live streaming where losing a packet is better than delaying data.

#### 8. **Port Numbers**
| Protocol | Common Ports | Use |
|:---|:---|:---|
| **HTTP** | 80 (TCP) | Web |
| **HTTPS** | 443 (TCP) | Secure Web |
| **FTP** | 21 (TCP) | File Transfer |
| **SSH** | 22 (TCP) | Secure Shell |
| **SMTP** | 25 (TCP) | Send Email |
| **DNS** | 53 (UDP) | Domain Names |
| **VoIP** | 5060 (UDP) | Voice |

**Pro Tip**: Port 1-1023 are well-known, 1024-49151 are registered, 49152-65535 are dynamic!`
    }
  }
};

module.exports = universalKnowledgeEnhanced;
