/// GPU 知识库条目模型
class GpuKnowledge {
  final int id;
  final String category;
  final String question;
  final String causes;
  final String diagnosis;
  final String solution;
  final String? difficulty;
  final String? cost;
  final String? successRate;

  GpuKnowledge({
    required this.id,
    required this.category,
    required this.question,
    required this.causes,
    required this.diagnosis,
    required this.solution,
    this.difficulty,
    this.cost,
    this.successRate,
  });

  factory GpuKnowledge.fromJson(Map<String, dynamic> json) {
    return GpuKnowledge(
      id: json['id'] ?? 0,
      category: json['category'] ?? '',
      question: json['question'] ?? '',
      causes: json['causes'] ?? '',
      diagnosis: json['diagnosis'] ?? '',
      solution: json['solution'] ?? '',
      difficulty: json['difficulty'],
      cost: json['cost'],
      successRate: json['successRate'] ?? json['success_rate'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category': category,
      'question': question,
      'causes': causes,
      'diagnosis': diagnosis,
      'solution': solution,
      'difficulty': difficulty,
      'cost': cost,
      'successRate': successRate,
    };
  }
}
