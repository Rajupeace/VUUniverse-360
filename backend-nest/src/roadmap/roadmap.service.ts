import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roadmap as RoadmapSchema, RoadmapDocument } from '../schemas/roadmap.schema';
import { Roadmap as RoadmapEntity } from '../entities/roadmap.entity';

@Injectable()
export class RoadmapService implements OnModuleInit {
  constructor(
    @InjectModel(RoadmapSchema.name) private roadmapModel: Model<RoadmapDocument>,
    @InjectRepository(RoadmapEntity) private roadmapRepo: Repository<RoadmapEntity>,
  ) { }

  async onModuleInit() {
    // Seed initial data if empty
    const count = await this.roadmapModel.countDocuments();
    if (count === 0) {
      const initial = [
        {
          slug: 'dsa', title: 'Data Structures & Algorithms', category: 'Algorithms',
          description: 'Master DSA logically with visual patterns and complexity analysis.', icon: 'FaCode', color: '#f59e0b',
          levels: [
            { title: 'Basics: Arrays & Strings', description: 'Master the fundamentals', topics: ['Time Complexity', 'Arrays', 'Strings', 'Sliding Window', 'Complexity Analysis'] },
            { title: 'Sorting & Searching', description: 'Advanced search patterns', topics: ['Binary Search', 'Quick Sort', 'Merge Sort', 'Heap Sort', 'Radix Sort'] },
            { title: 'Trees & Graphs', description: 'Non-linear hierarchical data', topics: ['Binary Trees', 'BST', 'BFS/DFS', 'Dijkstra', 'Graph Theory'] }
          ]
        },
        {
          slug: 'web', title: 'Modern Fullstack Web', category: 'Web Dev',
          description: 'Build industrial scale apps with React, Node, and Cloud patterns.', icon: 'FaLaptopCode', color: '#6366f1',
          levels: [
            { title: 'Frontend Basics', description: 'HTML, CSS and JavaScript', topics: ['Modern CSS', 'ES6+', 'DOM Manipulation', 'Git Fundamentals'] },
            { title: 'React Mastery', description: 'Hooks and State Management', topics: ['React Hooks', 'Context API', 'Performance', 'Redux/Toolkit'] },
            { title: 'Backend & APIs', description: 'Node.js and Database design', topics: ['Express.js', 'PostgreSQL', 'MongoDB', 'REST & GraphQL', 'OAuth2'] }
          ]
        },
        {
          slug: 'ai-ml', title: 'AI & Machine Learning', category: 'Data Science',
          description: 'Master predictive modeling and deep neural networks.', icon: 'FaRobot', color: '#10b981',
          levels: [
            { title: 'Python & Math', description: 'Theoretical foundations', topics: ['NumPy', 'Pandas', 'Linear Algebra', 'Calculus'] },
            { title: 'Supervised Learning', description: 'Classical ML Algorithms', topics: ['Regression', 'Classification', 'Random Forest', 'XGBoost'] },
            { title: 'Deep Learning', description: 'Complex Neural Architectures', topics: ['PyTorch', 'TensorFlow', 'CNN', 'RNN', 'Transformers'] }
          ]
        }
      ];

      for (const map of initial) {
        try {
          // SQL
          const entity = this.roadmapRepo.create(map);
          await this.roadmapRepo.save(entity);
          // Mongo
          await new this.roadmapModel(map).save();
        } catch (e) { /* ignore */ }
      }
      console.log('✅ Learning Roadmaps synchronized in cluster');
    }
  }

  async findAll(): Promise<any[]> {
    const fromSql = await this.roadmapRepo.find({ where: { isActive: true } });
    if (fromSql.length > 0) return fromSql;
    return this.roadmapModel.find({ isActive: true }).lean();
  }

  async findOne(slug: string): Promise<any> {
    const fromSql = await this.roadmapRepo.findOne({ where: { slug } });
    if (fromSql) return fromSql;
    return this.roadmapModel.findOne({ slug }).lean();
  }
}
