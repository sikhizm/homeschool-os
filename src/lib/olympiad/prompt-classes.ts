export const promptClasses = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;
export type PromptClass = typeof promptClasses[number];

// Topic groups checked against each linked SOF class syllabus on 2026-11-17.
export const classTopics: Record<PromptClass, readonly string[]> = {
  '1': ['Numbers up to 99', 'Addition and subtraction', 'Comparing lengths and weights', 'Time and money', 'Shapes and spatial reasoning', 'Patterns and logical reasoning', 'Mixed practice'],
  '2': ['Three-digit numbers', 'Arithmetic operations', 'Measurement and temperature', 'Time and money', 'Lines, shapes and solids', 'Pictographs', 'Patterns and logical reasoning', 'Mixed practice'],
  '3': ['Four-digit numbers', 'Arithmetic operations', 'Fractions', 'Measurement and temperature', 'Time and money', 'Shapes and geometry', 'Data handling', 'Patterns and logical reasoning', 'Mixed practice'],
  '4': ['Shapes and geometry', 'Numbers and place value', 'Fractions', 'Measurement', 'Patterns and logical reasoning', 'Arithmetic operations', 'Time and money', 'Perimeter and symmetry', 'Data handling', 'Mixed practice'],
  '5': ['Large numbers and operations', 'Fractions and decimals', 'Measurement and conversions', 'Time and money', 'Angles and symmetry', 'Area and perimeter', 'Data handling', 'Patterns and logical reasoning', 'Mixed practice'],
  '6': ['Number patterns and primes', 'Integers and zero', 'Fractions', 'Lines and angles', 'Geometric constructions and symmetry', 'Area and perimeter', 'Data handling', 'Verbal and non-verbal reasoning', 'Mixed practice'],
  '7': ['Large numbers and arithmetic expressions', 'Integers, fractions and decimals', 'Factors and multiples', 'Algebraic expressions and simple equations', 'Lines, angles and triangles', 'Congruence, constructions and tilings', 'Data handling', 'Verbal and non-verbal reasoning', 'Mixed practice'],
  '8': ['Squares, cubes and powers', 'Number patterns', 'Algebraic expressions', 'Proportional reasoning and fractions', 'Quadrilaterals and geometric themes', 'Pythagoras theorem', 'Area', 'Data handling', 'Verbal and non-verbal reasoning', 'Mixed practice'],
  '9': ['Number systems', 'Polynomials and algebraic identities', 'Linear equations in two variables', 'Sequences and progressions', 'Coordinate geometry', 'Lines, triangles and quadrilaterals', 'Circles and constructions', 'Area, surface area and volume', 'Statistics and probability', 'Verbal and non-verbal reasoning', 'Mixed practice'],
  '10': ['Real numbers and polynomials', 'Pairs of linear equations', 'Quadratic equations', 'Arithmetic progressions', 'Triangles and coordinate geometry', 'Trigonometry and applications', 'Circles and circle areas', 'Surface areas and volumes', 'Statistics and probability', 'Verbal and non-verbal reasoning', 'Mixed practice'],
};
export function olympiadSourcesFor(grade: PromptClass) {
  return [
    `https://sofworld.org/imo/class-${grade}/imo-syllabus/imo-syllabus-class-${grade}`,
    `https://sofworld.org/imo/class-${grade}/sample-model-test-papers/imo-sample-papers-class-${grade}`,
  ];
}
export function promptClassForStage(stage: string): PromptClass | null {
  const match = stage.trim().match(/^class\s*(10|[1-9])$/i);
  return match ? match[1] as PromptClass : null;
}
