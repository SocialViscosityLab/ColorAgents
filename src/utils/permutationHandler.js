// # Santiago Nunez-Corrales
// # University of Illinois at Urbana-Champaign
// #
// # Permutation generator at a given depth
// #
// # We assume that entries are generated 1..N for N!

class PermutationHandler {
    /**
     * Private. Create the objet for handle permutation samples
     * @param   {Number} n is the number of items to consider
     * @param   {Number} depth is the number of items that will be explored in 'order'
     * @param   {Nimber} samples counts how many randome samples of the remaining items should be taken
     */
    constructor(n, depth, samples) {
        this.depth = depth;
        this.n = n;
        this.samples = samples;

        this.permutations = new Set();
        this.curr = 0;
        this.sequence = [];
        for (let i = 0; i < n; i++) {this.sequence.push(i+1)}

        if(depth > n){
            console.error("Permutation depth is larger than permutation length.");
        }else if(depth == n){
            for (let i = 0; i < samples; i++) {
                  let tempSec = []
                  let s = [...this.sequence]
                  for (let j = 0; j < n; j++) {
                    let randomIdx = Math.floor(Math.random()* s.length);
                    tempSec.push(s.splice(randomIdx,1)[0]);
                }
                this.permutations.add(tempSec.join(' '));
            }
        }else{
            this.sequence.forEach(k => {
                this.generate(k,[],depth);
            });
        }
    }

    /**
     * Private. Records global viscosity data at the current tick
     * @param   {Number} k the current item explored 
     * @param   {Number} priors the items that are explored in order
     * @param   {Nimber} depth is the number of items that will be explored in 'order'
     */
    generate(k, priors, depth) {
        this.freevals = this.n - depth;
        
        let prior = priors.concat(k);
        let diffS = this.sequence.filter(x => !prior.includes(x));

        if(depth == 1){
            for (let i = 0; i < this.samples; i++) {
                let randSec = [];
                let s = [...diffS]
                for (let j = 0; j < this.freevals; j++) {
                    let randomIdx = Math.floor(Math.random()* s.length);
                    randSec.push(s.splice(randomIdx,1)[0]);
                }
                this.permutations.add((prior.concat(randSec)).join(' '));
            }
        }else{
            diffS.forEach(nk => {
                this.generate(nk, prior, depth-1)
            });
        }
    }

    density() {
        return this.size()/math.gamma(this.n+1);
    }
    size() {
        return this.permutations.size;
    }
    next() {
        let target = this.permutations[this.curr];
        this.curr = (self+1) % this.size();
        return target;
    }
}